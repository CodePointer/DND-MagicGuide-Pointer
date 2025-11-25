# -*- coding = utf-8 -*-
from typing import List
import requests
from pathlib import Path
from urllib.parse import quote
import re
from bs4 import BeautifulSoup
import json
import pandas as pd


class Spell:
    def __init__(self, h4_block=None, content_elements=None, additional_info=None):
        self.chinese_name = ''  # 火球术
        self.english_name = ''  # Fireball
        self.spell_id = ''
        self.source = 'Unknown'  # PHB24 / XGE / TCE / FTD / BMT / GGR / AI / SCC / AAG / SO  DropDown
        self.legacy = False  # False
        self.level = -1 # 3 DropDown
        self.school = ''  # 塑能 DropDown
        self.classes = []  # 术士、法师 DropDown
        self.casting_time = ''  # 动作
        self.condition = ''  # (触发条件)
        self.ritual = False  # False
        self.range = ''  # 150 尺
        self.components = []  # ['V', 'S', 'M']
        self.materials = ''  # 一颗蝙蝠粪和硫磺搓成的小球
        self.duration = ''  # 立即
        self.concentration = False  # False
        self.description = ''  # blabla
        if h4_block and content_elements:
            self.parse(h4_block, content_elements, additional_info)

    def _find_strong_tag_content(self, tag_name, p_block_str):
        pat1 = rf'<strong>{tag_name}：</strong>(.*?)(?=<br/?>)'
        pat2 = rf'<b>{tag_name}：</b>(.*?)(?=<br/?>)'
        pat3 = rf'{tag_name}：(.*?)(?=<br/?>)'
        match = re.search(pat1, p_block_str, re.I)
        if match is None:
            match = re.search(pat2, p_block_str, re.I)
        if match is None:
            match = re.search(pat3, p_block_str, re.I)
        return match
    
    def _sub_strong_tag_content(self, tag_name, input_str):
        pat1 = rf'<strong>{tag_name}：</strong>.*?<br/?>'
        pat2 = rf'<b>{tag_name}：</b>.*?<br/?>'
        pat3 = rf'{tag_name}：.*?<br/?>'
        return_str = re.sub(pat1, '', input_str, flags=re.I|re.S)
        return_str = re.sub(pat2, '', return_str, flags=re.I|re.S)
        return_str = re.sub(pat3, '', return_str, flags=re.I|re.S)
        return return_str

    def find_bracket_content(self, input_str):
        if '(' in input_str and ')' in input_str:
            lf_idx = input_str.find('(')
            rt_idx = input_str.rfind(')')
            return input_str[:lf_idx], input_str[lf_idx + 1:rt_idx]
        elif '（' in input_str and '）' in input_str:
            lf_idx = input_str.find('（')
            rt_idx = input_str.rfind('）')
            return input_str[:lf_idx], input_str[lf_idx + 1:rt_idx]
        else:
            return input_str, ''

    def parse(self, h4_block, content_elements, additional_info):
        if additional_info is None:
            additional_info = {}

        self.source = additional_info.get('source', 'Unknown')

        # Step 1: Parse h4_block for names
        names = h4_block.text.strip().split('｜')
        self.chinese_name = names[0].strip() if len(names) > 0 else ''
        self.english_name = names[1].strip() if len(names) > 1 else ''

        def to_chn_num(num_str):
            chn_num_map = {
                '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
                '六': 6, '七': 7, '八': 8, '九': 9
            }
            return chn_num_map.get(num_str, -1)

        # Step 2: Parse first content element for other attributes
        em = content_elements[0].find('em')
        if em:
            em_text = em.text.strip()
            # 0环：学派 戏法（职业）
            m0 = re.match(r'(\S+)\s*戏法（(.+?)）', em_text)
            # 高环：环数 学派（职业）
            m1 = re.match(r'([一二三四五六七八九]环)\s*(\S+)（(.+?)）', em_text)
            if m0:
                self.level = 0
                self.school = m0.group(1)
                self.classes = [cls.strip() for cls in m0.group(2).split('、')]
            elif m1:
                self.level = to_chn_num(m1.group(1).replace('环', ''))
                self.school = m1.group(2)
                self.classes = [cls.strip() for cls in m1.group(3).split('、')]
        
        if '' in self.classes:
            self.classes.remove('')
        for class_name in self.classes:
            if class_name.startswith('仪式'):
                self.ritual = True
                self.classes.remove(class_name)
                self.classes.append(class_name.replace('仪式', '').replace('；', '').strip())

        p_block_str = ''.join([str(x).replace('\n', '') for x in content_elements])
        p_block_str = re.sub(r'\s*width="[^"]*"', '', p_block_str)
        if 'width' in str(p_block_str):
            print('Debug')

        self.legacy = 'Legacy' in p_block_str

        # Step 3: Casting Time
        cast_time = self._find_strong_tag_content('施法时间', p_block_str)
        self.casting_time = cast_time.group(1).strip().replace(' ', '').replace('\n', '') if cast_time else ''
        # Check ritual
        if '仪式' in self.casting_time:
            self.ritual = True
            self.casting_time = self.casting_time.replace('仪式', '').replace('或', '').strip()
        # Check condition
        if '，' in self.casting_time:
            parts = self.casting_time.split('，', 1)
            self.casting_time = parts[0].strip()
            self.condition = parts[1].strip()

        # Step 4: Range
        spell_range = self._find_strong_tag_content('施法距离', p_block_str)
        self.range = spell_range.group(1).strip() if spell_range else ''

        # Step 5: Components
        components = self._find_strong_tag_content('法术成分', p_block_str)
        if components:
            components_str = components.group(1).replace(' ', '').replace('\n', '').strip()
            comp_str, material_str = self.find_bracket_content(components_str)
            self.materials = material_str.strip()

            self.components = []
            if '、' in comp_str:
                self.components = [comp.strip() for comp in comp_str.split('、', 2)]
            else:
                self.components = [comp.strip() for comp in comp_str.split(',', 2)]

        # Step 6: Duration
        duration = self._find_strong_tag_content('持续时间', p_block_str)
        self.duration = duration.group(1).replace(' ', '').replace('\n', '').strip() if duration else ''
        # Check concentration
        if '专注' in self.duration:
            self.concentration = True
            self.duration = self.duration.replace('专注，', '').strip()

        # Step 7: Description
        desc = p_block_str
        desc = re.sub(r'<em>.*?</em>\s*.*?<br/?>', '', desc, flags=re.S)
        desc = self._sub_strong_tag_content('施法时间', desc)
        desc = self._sub_strong_tag_content('施法距离', desc)
        desc = self._sub_strong_tag_content('法术成分', desc)
        desc = self._sub_strong_tag_content('持续时间', desc)
        desc = re.sub(r'^<p[^>]*>(.*)</p>$', r'\1', desc.strip(), flags=re.I|re.S)
        self.description = desc.strip().replace('\n', '').replace('\r', '')

        # Step 8: Spell ID
        self.spell_id = '_'.join([
            self.source,
            f'L{self.level}',
            self.english_name.lower().replace(' ', '-')
        ])

    def to_dict(self):
        return {
            'spellId': self.spell_id,
            'chineseName': self.chinese_name,
            'englishName': self.english_name,
            'source': self.source,
            'legacy': self.legacy,
            'level': self.level,
            'school': self.school,
            'classes': self.classes,
            'castingTime': self.casting_time,
            'condition': self.condition,
            'ritual': self.ritual,
            'range': self.range,
            'components': self.components,
            'materials': self.materials,
            'duration': self.duration,
            'concentration': self.concentration,
            'description': self.description
        }

    def to_json(self):
        return json.dumps(self.to_dict(), ensure_ascii=False)


def request_from_github(target_folder, folder_dict):
    for folder, url_paths in folder_dict.items():
        output_folder = target_folder / folder
        output_folder.mkdir(parents=True, exist_ok=True)
        for path in url_paths:
            url = f'https://raw.githubusercontent.com/DND5eChm/DND5e_chm/main/{quote(path)}'
            r = requests.get(url)
            if r.status_code == 200:
                content = r.content.decode('gbk')
                with open(output_folder / path.split('/')[-1], 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"已下载: {url}")
            else:
                print(f"下载失败: {url}")
    print("所有文件下载完成。")


def convert_html_to_table(htm_file) -> List[Spell]:
    """Input: html file. Output: A 2D array that follows the given column.
    
    Example: <H4 id="Acid_Splash">酸液飞溅｜Acid Splash</H4>
<P><EM>塑能 戏法（术士、法师）</EM> <BR><STRONG>施法时间：</STRONG>动作<BR><STRONG>施法距离：</STRONG>60 尺<BR><STRONG>法术成分：</STRONG>V、S<BR><STRONG>持续时间：</STRONG>立即<BR>你在施法距离内一点创造出一颗酸液泡，以该点5尺<U>球状</U>范围爆发。该球状区域内的每名生物必须通过一次敏捷豁免，否则受到1d6点强酸伤害。<BR><STRONG>戏法强化。</STRONG>本法术的伤害会在你达到下列等级时提升1d6：5级（2d6）、11级（3d6）以及17级（4d6）。</P>

    Output should be in column (head not included):
    ['Chinese Name', 'English Name', 'Level', 'School', 'Classes', 'Casting Time', 'Range', 'Components', 'Duration', 'Description']
    which is
    ['酸液飞溅', 'Acid Splash', '0', '塑能', '术士|||法师', '动作', '60 尺', 'V|||S', '立即', '你在施法距离内一点创造出一颗酸液泡，以该点5尺<U>球状</U>范围爆发。该球状区域内的每名生物必须通过一次敏捷豁免，否则受到1d6点强酸伤害。<BR><STRONG>戏法强化。</STRONG>本法术的伤害会在你达到下列等级时提升1d6：5级（2d6）、11级（3d6）以及17级（4d6）。']
    The array is separated by |||.
    """
    # 读取HTML内容
    with open(htm_file, encoding='utf-8') as f:
        html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    # 结果列表
    result = []
    # 获取所有法术块
    h4_tags = soup.find_all('h4')
    # 遍历法术
    for h4 in h4_tags:
        content_elements = []
        for sibling in h4.next_siblings:
            if sibling.name == 'h4':
                break
            if isinstance(sibling, str):
                continue
            content_elements.append(sibling)
        if not content_elements:
            continue
        # 解析法术基本信息
        result.append(Spell(h4, content_elements, additional_info={'source': htm_file.parent.name}))
    return result


def main():
    folder_dict = {
        'PHB24': [f'玩家手册2024/法术详述/{x}环.htm' for x in range(0, 10)],
        'XGE': [f'珊娜萨的万事指南/法术/法术详述/{x}环.html' for x in range(1, 10)] + ['珊娜萨的万事指南/法术/法术详述/戏法.html'],
        'TCE': [f'塔莎的万事坩埚/法术/法术详述/{x}环.html' for x in range(1, 10) if x != 8] + ['塔莎的万事坩埚/法术/法术详述/戏法.html'],
        'SCC': [f'斯翠海文：混沌研习/玩家选项/法术详述.html'],
        'FTD': [f'费资本的巨龙宝库/玩家选项/巨龙法术详述.htm'],
    }
    target_folder = Path('spells')
    htm_file_list = []
    for folder, url_paths in folder_dict.items():
        for htm_sub_path in url_paths:
            htm_file_list.append(target_folder / folder / htm_sub_path.split('/')[-1])

    # request_from_github(target_folder, folder_dict)

    spell_list = []
    for htm_file in htm_file_list:
        spells = convert_html_to_table(htm_file)
        spell_list.extend(spells)
        print(f'Processed {htm_file.parent.name} - {htm_file.name}, found {len(spells)} spells.')

    # Using Dataframe to check spells
    df = pd.DataFrame([spell.to_dict() for spell in spell_list if spell.legacy is False])
    # df.to_excel('all_spells.xlsx', index=False)
    df.to_csv('all_spells.csv', index=False, encoding='utf-8')

    # Output js file
    # with open('all_spells.js', 'w', encoding='utf-8') as f:
    #     f.write('const allSpells = ')
    #     json.dump([spell.to_dict() for spell in spell_list if spell.legacy is False], f, ensure_ascii=False)
    #     f.write(';\n')
    #     f.write('export default allSpells;\n')

    # 输出所有法术的JSON表示
    # spell_list_json = [spell.to_dict() for spell in spell_list if spell.legacy is False]
    # with open('all_spells.json', 'w', encoding='utf-8') as f:
    #     json.dump(spell_list_json, f, ensure_ascii=False)
    #     json_spells = [spell.to_json() + '\n' for spell in spell_list if spell.legacy is False]
    #     f.writelines(json_spells)


if __name__ == '__main__':
    main()
