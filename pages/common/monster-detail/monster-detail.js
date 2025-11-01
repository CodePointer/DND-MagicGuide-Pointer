// pages/common/monster-detail/monster-detail.js
const abilityKeys = [
  'strength', 'dexterity', 
  'constitution', 'intelligence',
  'wisdom', 'charisma'
];
const abilityName = [
  '力量', '敏捷', '体质', 
  '智力', '感知', '魅力'
];

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
    propertyPair: [],
    sectionPair: [],
    footNoteDesc: ''
  },

  observers: {
    monster(monster) {
      const abilityBlock = abilityKeys.reduce((acc, key) => {
        acc[key] = {
          scores: monster[key]?.scores || 'xx',
          mod: monster[key]?.scores || '+x',
          save: monster[key].save || '+x'
        };
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
          ac: monster.ac || '[ac]',
          hp: monster.hp || '[hp]',
          speed: monster.speed || '[speed]',
          initiative: monster.initiative || '[initiative]',
          ...abilityBlock,
          skills: monster.skills || '',
          damageVulnerabilities: monster.damageVulnerabilities || '',
          damageResistances: monster.damageResistances || '',
          damageImmunities: monster.damageImmunities || '',
          equipment: monster.equipment || '',
          senses: monster.senses || '',
          languages: monster.languages || '',
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
        footNoteDesc: `CR ${monster.challengeRating} | PB ${monster.proficiencies}`
      });
    },
    processTable() {
      const monster = this.data.procMonster;
      this.setData({
        tableInfo: {
          title: abilityName,
          scores: abilityKeys.map((key, _) => monster[key].scores),
          mod: abilityKeys.map((key, _) => monster[key].mod),
          save: abilityKeys.map((key, _) => monster[key].save)
        }
      })
    }
  }
})