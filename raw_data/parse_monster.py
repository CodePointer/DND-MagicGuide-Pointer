# -*- coding = utf-8 -*-
from typing import List
from tqdm import tqdm
from pathlib import Path
import re
from bs4 import BeautifulSoup
import json
import pandas as pd


class Ability:
    scores = ''
    mod = ''
    save = ''


class ActionSection:
    title = ''
    content = ''


class Monster:
    def __init__(self):
        self.chinese_name = ''
        self.english_name = ''
        self.monster_id = ''
        self.source = 'MM25'
        self.size = []  # List[str]
        self.swarm = False
        self.swarm_size = ''
        self.type = []  # List[str]
        self.sub_type = ''
        self.alignment = ''
        self.ac = ''
        self.hp = ''
        self.speed = ''
        self.initiative = ''
        
        self.strength = Ability()
        self.dexterity = Ability()
        self.constitution = Ability()
        self.intelligence = Ability()
        self.wisdom = Ability()
        self.charisma = Ability()

        self.skills = ''
        self.damage_vulnerabilities = ''
        self.damage_resistances = ''
        self.damage_immunities = ''
        self.equipment = ''
        self.senses = ''
        self.languages = ''
        self.challenge_rating = ''
        self.proficiencies = ''

        self.sections = []  # List[ActionSection]

    def to_dict(self):
        data = self.__dict__.copy()
        data['strength'] = self.strength.__dict__
        data['dexterity'] = self.dexterity.__dict__
        data['constitution'] = self.constitution.__dict__
        data['intelligence'] = self.intelligence.__dict__
        data['wisdom'] = self.wisdom.__dict__
        data['charisma'] = self.charisma.__dict__
        data['sections'] = [section.__dict__ for section in self.sections]
        return data
    
    def to_json(self):
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=4)

    def parse_from_block(self, block: str):
        '''从HTML stat-block解析怪物数据'''
        soup = BeautifulSoup(block, 'html.parser')
        
        # 解析名称 (H5标签)
        name_element = soup.find('h5')
        if name_element:
            name_text = name_element.get_text().strip()
            # 分离中文名和英文名 (格式: '中文名 English Name')
            # 查找第一个英文字母的位置
            english_start = -1
            for i, char in enumerate(name_text):
                if char.isalpha() and ord(char) < 128:  # 英文字母
                    english_start = i
                    break
            
            if english_start > 0:
                self.chinese_name = name_text[:english_start].strip()
                self.english_name = name_text[english_start:].strip()
            else:
                # 如果没有找到英文，整个作为中文名
                self.chinese_name = name_text
                self.english_name = ''
        
        # 解析基本信息 (sub-line)
        sub_line = soup.find('div', class_='sub-line')
        if sub_line:
            sub_text = sub_line.get_text().strip()
            # 解析格式: '大小种族（子种族），阵营'
            parts = re.split(',|，', sub_text)
            if len(parts) >= 2:
                # 处理群体类型
                if '集群' in sub_text:
                    self.swarm = True
                    de_idx = parts[0].find('的')
                    self.swarm_size = parts[0][de_idx+1:parts[0].find('集群')]
                    parts[0] = parts[0][:de_idx]
                # 解析大小和种族
                size_type_part = parts[0]
                # 查找大小词汇
                split_index = parts[0].rfind('型') + 1
                if split_index <= 0:
                    self.type = size_type_part
                else:
                    sizes = ['超微型', '微型', '小型', '中型', '大型', '巨型', '超巨型']
                    for possible_size in sizes:
                        if possible_size in parts[0][:split_index]:
                            self.size.append(possible_size)
                    self.type = parts[0][split_index:]
                # 解析子种族
                if '（' in size_type_part and '）' in self.type:
                    start_idx = self.type.find('（')
                    end_idx = self.type.find('）')
                    self.sub_type = self.type[start_idx+1:end_idx]
                    self.type = self.type[:start_idx]
                # 解析阵营
                self.alignment = parts[1].strip()
        
        # 解析属性表格
        tables = soup.find_all('table')
        
        # 第一个表格通常包含AC, HP, 速度
        if len(tables) > 0:
            first_table = tables[0]
            for row in first_table.find_all('tr'):
                cells = row.find_all('td')
                for cell in cells:
                    text = cell.get_text().strip()
                    if text.startswith('AC '):
                        self.ac = text[3:]
                    elif text.startswith('HP '):
                        self.hp = text[3:]
                    elif text.startswith('速度 '):
                        self.speed = text[3:]
                    elif text.startswith('先攻 '):
                        self.initiative = text[3:]

        # 第二个表格通常是能力值
        if len(tables) > 1:
            ability_table = tables[1]
            rows = ability_table.find_all('tr')
            if len(rows) >= 2:
                # 解析能力值表格
                # 第一行: 力量、敏捷、体质
                first_row = rows[1].find_all('td')
                # 过滤掉空的td元素
                non_empty_cells = [cell for cell in first_row if cell.get_text().strip()]
                
                # 力量 (前4个非空单元格)
                if len(non_empty_cells) >= 4:
                    # 跳过'力量'标签，取值、调整、豁免
                    self.strength.scores = non_empty_cells[1].get_text().strip()
                    self.strength.mod = non_empty_cells[2].get_text().strip()
                    self.strength.save = non_empty_cells[3].get_text().strip()
                
                # 敏捷 (第5-8个非空单元格)
                if len(non_empty_cells) >= 8:
                    self.dexterity.scores = non_empty_cells[5].get_text().strip()
                    self.dexterity.mod = non_empty_cells[6].get_text().strip()
                    self.dexterity.save = non_empty_cells[7].get_text().strip()
                
                # 体质 (第9-12个非空单元格)
                if len(non_empty_cells) >= 12:
                    self.constitution.scores = non_empty_cells[9].get_text().strip()
                    self.constitution.mod = non_empty_cells[10].get_text().strip()
                    self.constitution.save = non_empty_cells[11].get_text().strip()
                
                # 第二行: 智力、感知、魅力
                if len(rows) >= 3:
                    second_row = rows[2].find_all('td')
                    non_empty_cells2 = [cell for cell in second_row if cell.get_text().strip()]
                    
                    # 智力
                    if len(non_empty_cells2) >= 4:
                        self.intelligence.scores = non_empty_cells2[1].get_text().strip()
                        self.intelligence.mod = non_empty_cells2[2].get_text().strip()
                        self.intelligence.save = non_empty_cells2[3].get_text().strip()
                    
                    # 感知
                    if len(non_empty_cells2) >= 8:
                        self.wisdom.scores = non_empty_cells2[5].get_text().strip()
                        self.wisdom.mod = non_empty_cells2[6].get_text().strip()
                        self.wisdom.save = non_empty_cells2[7].get_text().strip()
                    
                    # 魅力
                    if len(non_empty_cells2) >= 12:
                        self.charisma.scores = non_empty_cells2[9].get_text().strip()
                        self.charisma.mod = non_empty_cells2[10].get_text().strip()
                        self.charisma.save = non_empty_cells2[11].get_text().strip()
        
        # 第三个表格通常包含技能、抗性等信息
        text_cells = []
        if len(tables) > 2:
            info_table = tables[2]
            for row in info_table.find_all('tr'):
                cells = row.find_all('td')
                for cell in cells:
                    text_cells.append(cell.get_text().strip())
        else:
            p_tag = soup.select_one('p font[color="#800000"]')
            if p_tag:
                text_cells = p_tag.parent.get_text().strip().split('\n')
        
        for text in text_cells:
            if text.startswith('技能 '):
                self.skills = text[3:]
            elif text.startswith('易伤 '):
                self.damage_vulnerabilities = text[3:]
            elif text.startswith('抗性 '):
                self.damage_resistances = text[3:]
            elif text.startswith('免疫 '):
                self.damage_immunities = text[3:]
            elif text.startswith('感官 '):
                self.senses = text[3:]
            elif text.startswith('语言 '):
                self.languages = text[3:]
            elif text.startswith('CR '):
                self.challenge_rating = text[3:]
                start_idx = self.challenge_rating.find('（')
                pb_idx = self.challenge_rating.find('PB')
                end_idx = self.challenge_rating.find('）')
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    self.proficiencies = self.challenge_rating[pb_idx+2:end_idx].strip()
                    self.challenge_rating = self.challenge_rating[:start_idx].strip()

        if self.challenge_rating == '':
            print('warning')

        # 解析动作部分
        action_sections = soup.find_all('h6')
        for h6 in action_sections:
            section = ActionSection()
            section.title = h6.get_text().strip()
            
            # 获取该部分的内容
            content_elements = []
            next_element = h6.find_next_sibling()
            while next_element and next_element.name != 'h6':
                if next_element.name == 'p':
                    content_elements.append(next_element)
                next_element = next_element.find_next_sibling()
            
            # 将content_elements转换为保留格式的富文本字符串
            section.content = ''.join(str(element) for element in content_elements)
            self.sections.append(section)

        # 生成monster_id
        self.monster_id = '_'.join([
            self.source,
            f'Prof{self.proficiencies[1] if self.proficiencies else "0"}',
            f'CR{self.challenge_rating.replace("/", "_") if self.challenge_rating else "0"}',
            self.english_name.lower().replace(' ', '_') if self.english_name else '',
        ])


def parse_monster_file(file_path: Path) -> List[Monster]:
    '''解析怪物HTML文件，提取stat-block内容并创建Monster对象'''
    monsters = []
    
    try:
        content = None
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        if content is None:
            print(f'无法读取文件: {file_path}')
            return monsters
        
        # 使用BeautifulSoup解析HTML
        soup = BeautifulSoup(content, 'html.parser')
        
        # 查找所有class='stat-block'的div元素
        stat_blocks = soup.find_all('div', class_='stat-block')
        
        if not stat_blocks:
            # print(f'警告: 文件中未找到stat-block: {file_path}')
            return monsters
        
        for i, stat_block in enumerate(stat_blocks):
            try:
                # 创建Monster对象
                monster = Monster()
                
                # 将stat-block的HTML内容传递给parse_from_block方法
                monster.parse_from_block(str(stat_block))
                
                # 添加到结果列表
                monsters.append(monster)
                
            except Exception as e:
                print(f'解析stat-block时发生错误 (文件: {file_path}, 块: {i+1}): {e}')
                continue
    
    except FileNotFoundError:
        print(f'文件未找到: {file_path}')
    except Exception as e:
        print(f'解析文件时发生未知错误: {file_path}, 错误: {e}')
    
    return monsters


def main():
    monster_folder = Path('monsters')

    file_lists = [x for x in monster_folder.rglob('*.htm') if x.stem != '数据卡概览']
    # file_lists = ['monsters/元素/火童.htm']
    all_monsters = []
    with tqdm(total=len(file_lists), desc='Monster Found: 0') as pbar:
        for file_path in file_lists:
            monsters = parse_monster_file(file_path)
            all_monsters.extend(monsters)
            pbar.set_description(f'Monster Found: {len(all_monsters)}')
            pbar.update(1)

    df = pd.DataFrame([monster.to_dict() for monster in all_monsters])
    # for col in df.columns:
    #     try:
    #         if col in ['challenge_rating', 'proficiencies']:
    #             print(f'{col}:')
    #             print(df[col].unique())
    #         if '' in df[col].unique():
    #             print(f'警告: 列 {col} 包含空值')
    #     except Exception as e:
    #         pass
    df.to_csv('monsters_parsed.csv', index=False, encoding='utf-8')

    with open('all_monsters.js', 'w', encoding='utf-8') as f:
        f.write('const allMonsters = ')
        json.dump([monster.to_dict() for monster in all_monsters], f, ensure_ascii=False)
        f.write(';\n')
        f.write('export default allMonsters;\n')


if __name__ == '__main__':
    main()
