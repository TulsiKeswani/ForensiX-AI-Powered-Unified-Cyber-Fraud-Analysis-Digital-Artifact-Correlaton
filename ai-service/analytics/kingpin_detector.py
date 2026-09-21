import networkx as nx
from typing import Dict, List, Any

def detect_kingpin_and_linkages(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Applies PageRank, Betweenness Centrality, Degree Centrality, and 
    Risk Scoring to predict the Main Suspect / Kingpin in a cyber fraud network.
    Also generates an explicit Evidence Linkage Summary (Who connected with whom).
    """
    if not nodes:
        return {
            'mainSuspect': None,
            'linkageSummary': [],
            'rankings': []
        }

    G = nx.Graph()
    node_map = {n['id']: n for n in nodes}

    for n in nodes:
        G.add_node(n['id'])

    for e in edges:
        G.add_edge(e['source'], e['target'])

    # PageRank
    try:
        pagerank = nx.pagerank(G, alpha=0.85)
    except Exception:
        pagerank = {n: 1.0 / max(len(G.nodes), 1) for n in G.nodes}

    # Betweenness
    try:
        betweenness = nx.betweenness_centrality(G)
    except Exception:
        betweenness = {n: 0.0 for n in G.nodes}

    degrees = dict(G.degree())

    rankings = []
    for node_id in G.nodes:
        n_data = node_map.get(node_id, {})
        pr = pagerank.get(node_id, 0.0)
        bw = betweenness.get(node_id, 0.0)
        deg = degrees.get(node_id, 0)
        
        # Risk score calculation
        n_type = n_data.get('type', '')
        base_risk = 50
        if n_type in ['BANK_ACCOUNT', 'UPI_ID']:
            base_risk += 25
        elif n_type in ['PHONE', 'IMEI', 'APK']:
            base_risk += 15

        # Structural weight: high betweenness & degree indicates a hub / kingpin
        structural_score = (pr * 40) + (bw * 40) + (min(deg, 10) * 2)
        total_risk_score = min(round(base_risk + structural_score), 99)

        risk_reasons = []
        if deg >= 3:
            risk_reasons.append(f"High connectivity hub ({deg} linked entities)")
        if bw > 0.3:
            risk_reasons.append(f"Bridge entity connecting separate fraud clusters (Bridge Score: {round(bw, 2)})")
        if n_type == 'BANK_ACCOUNT':
            risk_reasons.append("Multi-hop fund transfer destination")
        elif n_type == 'IMEI':
            risk_reasons.append("Shared IMEI across multiple SIM numbers")
        elif n_type == 'APK':
            risk_reasons.append("Malicious APK payload detected on device")

        rankings.append({
            'id': node_id,
            'type': n_type,
            'label': n_data.get('label', node_id),
            'value': n_data.get('value', node_id),
            'riskScore': total_risk_score,
            'pageRank': round(pr, 3),
            'betweenness': round(bw, 3),
            'degree': deg,
            'riskReasons': risk_reasons
        })

    # Sort rankings descending by riskScore & pageRank
    rankings.sort(key=lambda x: (x['riskScore'], x['pageRank']), reverse=True)
    main_suspect = rankings[0] if rankings else None

    # Evidence Linkage Summary (Who connected with whom)
    linkage_summary = []
    for idx, edge in enumerate(edges):
        src_node = node_map.get(edge['source'], {})
        tgt_node = node_map.get(edge['target'], {})
        linkage_summary.append({
            'id': edge.get('id', f"LINK_{idx}"),
            'sourceLabel': src_node.get('label', edge['source']),
            'sourceType': src_node.get('type', 'ENTITY'),
            'relationship': edge.get('type', 'LINKED_TO'),
            'targetLabel': tgt_node.get('label', edge['target']),
            'targetType': tgt_node.get('type', 'ENTITY'),
            'evidenceId': edge.get('evidenceId', 'Primary Upload')
        })

    return {
        'mainSuspect': main_suspect,
        'linkageSummary': linkage_summary,
        'rankings': rankings
    }
