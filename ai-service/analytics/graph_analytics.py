import networkx as nx
from typing import Dict, List, Any

def compute_graph_analytics(nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]) -> Dict[str, Dict[str, float]]:
    """
    Computes PageRank (Graph Importance), Betweenness Centrality (Bridge Score),
    and Degree Centrality (Connection Count) for an investigation network.
    """
    G = nx.Graph()

    for node in nodes:
        G.add_node(node['id'])

    for edge in edges:
        G.add_edge(edge['source'], edge['target'])

    if len(G.nodes) == 0:
        return {}

    # PageRank (Graph Importance)
    try:
        pagerank = nx.pagerank(G, alpha=0.85)
    except Exception:
        pagerank = {n: 1.0 / len(G.nodes) for n in G.nodes}

    # Betweenness Centrality (Bridge Score)
    try:
        betweenness = nx.betweenness_centrality(G)
    except Exception:
        betweenness = {n: 0.0 for n in G.nodes}

    # Degree
    degrees = dict(G.degree())

    results = {}
    for node_id in G.nodes:
        results[node_id] = {
            'graphImportance': round(pagerank.get(node_id, 0.0), 3),
            'bridgeScore': round(betweenness.get(node_id, 0.0), 3),
            'connectionCount': degrees.get(node_id, 0)
        }

    return results
