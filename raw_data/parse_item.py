# -*- coding = utf-8 -*-

from pathlib import Path
import json


class Item:
    def __init__(self, default_values=None):
        if default_values is None:
            default_values = {}
        self.chinese_name = default_values.get('chinese_name', '')
        self.english_name = default_values.get('english_name', '')
        self.item_type = default_values.get('item_type', '')
        self.is_magical = default_values.get('is_magical', False)
        self.need_attunement = default_values.get('need_attunement', False)
        self.rarity = default_values.get('rarity', [])  # 普通，非普通，珍惜，极珍稀，传说，神器
        self.weight = default_values.get('weight', 0.0)
        self.price = default_values.get('price', 0)
        self.description = default_values.get('description', '')

    def _snake_to_camel(self, snake_str):
        components = snake_str.split('_')
        return components[0] + ''.join(x.title() for x in components[1:])
    
    def to_dict(self):
        result = {}
        for key, value in self.__dict__.items():
            camel_key = self._snake_to_camel(key)
            result[camel_key] = value
        return result
    
    def to_json(self):
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=4)
    

def main():
    pass


if __name__ == '__main__':
    main()
