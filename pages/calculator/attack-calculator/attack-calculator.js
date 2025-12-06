// pages/calculator/attack-calculator/attach-calculator.js
const levelData = new Array(20).fill(null).map((_, i) => ({
  label: `Lv ${i + 1}`,
  value: i + 1
}));

const abilityData = new Array(21).fill(null).map((_, i) => ({
  label: `属性 ${20 - i}`,
  value: 20 - i
}));
const hasProficiencyData = [
  { label: '有熟练项', value: true },
  { label: '无熟练项', value: false },
];
const weaponData = [
  { label: '普通', value: 0 },
  { label: '非普通 (+1)', value: 1 },
  { label: '珍稀 (+2)', value: 2 },
  { label: '极珍稀 (+3)', value: 3 },
];
const defaultData = [{ label: '无', value: 0 }];

Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    pickerVisible: false,
    pickerTitle: '',
    pickerData: defaultData,
    pickerDataKey: '',

    selectedLevel: null,
    selectedAbility: null,
    selectedHasProficiency: null,
    selectedWeapon: null,
    
    reportAttachRoll: null,
    detailAttachRoll: [],

    reportDamageRoll: null,
    detailDamageRoll: [],

    activePanels: [],
  },

  observers: {
    'selectedLevel, selectedAbility, selectedHasProficiency, selectedWeapon'(
      level, ability, hasProficiency, weapon
    ) {
      if (level && ability && hasProficiency && weapon !== null) {
        const proficiencyValue = Math.floor(2 + (level.value - 1) / 4);
        const abilityValue = Math.floor((ability.value - 10) / 2);
        const totalAttachRoll = abilityValue + (hasProficiency.value ? proficiencyValue : 0) + weapon.value;
        this.setData({
          reportAttachRoll: `+${totalAttachRoll}`,
          detailAttachRoll: [
            `+${abilityValue}`,
            `+${hasProficiency.value ? proficiencyValue : 0}`,
            `+${weapon.value}`,
          ],
        });
        const totalDamageRoll = abilityValue + weapon.value;
        this.setData({
          reportDamageRoll: `+${totalDamageRoll}`,
          detailDamageRoll: [
            `+${abilityValue}`,
            `+${weapon.value}`,
          ],
        });
      } else {
        this.setData({
          reportAttachRoll: null,
          detailAttachRoll: [],
          reportDamageRoll: null,
          detailDamageRoll: [],
        });
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlePanelChange(e) {
      this.setData({
        activePanels: e.detail.value,
      });
    },
    onLevelButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '选择等级',
        pickerData: levelData,
        pickerDataKey: 'level',
      });
    },
    onAbilityButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '选择主要属性',
        pickerData: abilityData,
        pickerDataKey: 'ability',
      });
    },
    onHasProficiencyButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '是否有熟练加值',
        pickerData: hasProficiencyData,
        pickerDataKey: 'hasProficiency',
      });
    },
    onWeaponButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '选择武器品质',
        pickerData: weaponData,
        pickerDataKey: 'weapon',
      });
    },
    onPickerCancel(e) {
      this.setData({
        pickerVisible: false,
      });
    },
    onPickerConfirm(e) {
      const dataKey = e.currentTarget.dataset.key;
      const selectedItem = {
        value: e.detail.value[0],
        label: e.detail.label[0]
      };
      if (dataKey === 'level') {
        this.setData({
          selectedLevel: selectedItem,
          pickerVisible: false,
        });
      } else if (dataKey === 'ability') {
        this.setData({
          selectedAbility: selectedItem,
          pickerVisible: false,
        });
      } else if (dataKey === 'hasProficiency') {
        this.setData({
          selectedHasProficiency: selectedItem,
          pickerVisible: false,
        });
      } else if (dataKey === 'weapon') {
        this.setData({
          selectedWeapon: selectedItem,
          pickerVisible: false,
        });
      }
    },
  }
})