// utils/dataprocessor.js


function processSpellData(rawData) {
  const allSpellsMap = rawData.reduce((map, spell) => {
    map[spell.spellId] = spell;
    return map;
  }, {});
  const allSpellsInfo = rawData.map(spell => ({
    id: spell.spellId,
    spellId: spell.spellId,
    chineseName: spell.chineseName,
    englishName: spell.englishName,
    level: spell.level,
    classes: spell.classes,
    school: spell.school,
    source: spell.source,
    concentration: spell.concentration,
    ritual: spell.ritual,
  }));
  return { allSpellsMap, allSpellsInfo };
}


function processMonsterData(rawData) {
  const allMonstersMap = rawData.reduce((map, monster) => {
    map[monster.monsterId] = monster;
    return map;
  }, {});
  const allMonstersInfo = rawData.map(monster => ({
    id: monster.monsterId,
    monsterId: monster.monsterId,
    chineseName: monster.chineseName,
    englishName: monster.englishName,
    size: monster.size,
    type: monster.type,
    alignment: monster.alignment,
    challengeRating: monster.challengeRating,
    proficiencies: monster.proficiencies,
    swarm: monster.swarm,
  }));
  return { allMonstersMap, allMonstersInfo };
}


module.exports = {
  processSpellData,
  processMonsterData,
};
