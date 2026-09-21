from typing import Dict, List, Any

class EntityResolver:
    def __init__(self):
        self.entity_map = {} # canonical_val -> entity_obj
        self.counters = {}

    def _generate_id(self, entity_type: str) -> str:
        count = self.counters.get(entity_type, 0) + 1
        self.counters[entity_type] = count
        prefix = entity_type.upper()
        return f"{prefix}_{str(count).zfill(3)}"

    def resolve(self, raw_entity: Dict[str, Any], evidence_id: str = "") -> Dict[str, Any]:
        e_type = raw_entity.get('type', 'UNKNOWN')
        c_val = raw_entity.get('value', '')
        key = f"{e_type}:{c_val}"

        if key in self.entity_map:
            ent = self.entity_map[key]
            if evidence_id and evidence_id not in ent['sources']:
                ent['sources'].append(evidence_id)
            if raw_entity.get('raw') and raw_entity['raw'] not in ent['aliases']:
                ent['aliases'].append(raw_entity['raw'])
            return ent
        else:
            canonical_id = self._generate_id(e_type)
            ent_obj = {
                'id': canonical_id,
                'type': e_type,
                'canonical_value': c_val,
                'aliases': [raw_entity.get('raw', c_val)],
                'sources': [evidence_id] if evidence_id else []
            }
            self.entity_map[key] = ent_obj
            return ent_obj

    def get_all_entities((self) -> List[Dict[str, Any]]:
        return list(self.entity_map.values())
