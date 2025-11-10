// pages/common/monster-detail/monster-detail.js
const abilityDicts = {
  'strength': '力量',
  'dexterity': '敏捷',
  'constitution': '体质',
  'intelligence': '智力',
  'wisdom': '感知',
  'charisma': '魅力'
};
const shortPropertyDicts = {
  // 'ac': 'AC',
  'hp': 'HP',
  'initiative': '先攻'
};
const propertyDicts = {
  'speed': '速度',
  'skills': '技能',
  'damageVulnerabilities': '伤害易伤',
  'damageResistances': '伤害抗性',
  'damageImmunities': '伤害免疫',
  'senses': '感知',
  'languages': '语言',
  'equipment': '装备'
};

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    monster: {
      type: Object,
      value: {}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    titleDesc: '',
    subTitleDesc: '',
    tableInfo: {
      title: [],
      scores: [],
      mod: [],
      save: []
    },
    shortPropertyPair: [],
    propertyPair: [],
    sectionPair: [],
    footNoteDesc: ''
  },

  observers: {
    monster(monster) {
      const abilityBlock = Object.keys(abilityDicts).reduce((acc, key) => {
        acc[key] = {
          scores: monster[key]?.scores || 'xx',
          mod: monster[key]?.mod || '+x',
          save: monster[key]?.save || '+x'
        };
        return acc;
      }, {});
      const shortPropertyBlock = Object.keys(shortPropertyDicts).reduce((acc, key) => {
        acc[key] = monster[key] || `[${shortPropertyDicts[key]}]`;
        return acc;
      }, {});
      const propertyBlock = Object.keys(propertyDicts).reduce((acc, key) => {
        acc[key] = monster[key] || `[${propertyDicts[key]}]`;
        return acc;
      }, {});
      this.setData({
        procMonster: {
          id: monster.monsterId || '[id]',
          monsterId: monster.monsterId || '[monsterId]',
          chineseName: monster.chineseName || '[怪物名称]',
          englishName: monster.englishName || '[Name]',
          source: monster.source || '[source]',
          size: monster.size || [],
          swarm: monster.swarm || false,
          swarmSize: monster.swarmSize || '',
          type: monster.type || '[type]',
          subType: monster.subType || '',
          alignment: monster.alignment || '[alignment]',
          ...abilityBlock,
          ...shortPropertyBlock,
          ...propertyBlock,
          ac: monster.ac || '[AC]',
          challengeRating: monster.challengeRating || '[CR]',
          proficiencies: monster.proficiencies || '',
          sections: [
            ...(monster.sections || [{
              title: '[标题]',
              content: '[内容]'
            }])
          ],
          ...monster
        }
      });
      this.processDesc();
      this.processTable();
      this.processProperty();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    processDesc() {
      const monster = this.data.procMonster;
      const sizeAndType = `${monster.size.join('/')} ${monster.type}${monster.subType ? ` (${monster.subType})` : ''}`;
      const swarmType = monster.swarm ? ` - ${monster.swarmSize}集群` : '';
      this.setData({
        titleDesc: `${monster.chineseName} (${monster.englishName})`,
        subTitleDesc: `${sizeAndType}${swarmType}, ${monster.alignment}`,
        footNoteDesc: `AC ${monster.ac} | CR ${monster.challengeRating} | PB ${monster.proficiencies}`
      });
    },
    processTable() {
      const monster = this.data.procMonster;
      this.setData({
        tableInfo: {
          title: Object.values(abilityDicts),
          scores: Object.keys(abilityDicts).map((key, _) => monster[key].scores),
          mod: Object.keys(abilityDicts).map((key, _) => monster[key].mod),
          save: Object.keys(abilityDicts).map((key, _) => monster[key].save)
        }
      })
    },
    processProperty() {
      const monster = this.data.procMonster;
      this.setData({
        shortPropertyPair: Object.keys(shortPropertyDicts).map((key) => {
          return {
            title: shortPropertyDicts[key],
            desc: monster[key]
          };
        }),
        propertyPair: Object.keys(propertyDicts).map((key) => {
          return {
            title: propertyDicts[key],
            desc: monster[key]
          };
        }).filter(item => item.desc && item.desc.length > 0)
      });
    }
  }
})