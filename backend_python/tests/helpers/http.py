"""Helper HTTP pour les tests d'intégration.
Utilise le test_client de Flask pour les tests.
"""
import time
import json


def request(client, path, method="GET"):
    """Envoie une requête HTTP au client de test Flask.
    
    Args:
        client: Client de test Flask (app.test_client())
        path: Chemin + query string
        method: Méthode HTTP (défaut: "GET")
        
    Returns:
        dict: Contient status, headers, body, duration
    """
    start = time.time()
    
    response = client.open(path, method=method)
    
    # Lire la réponse
    data = response.get_data(as_text=True)
    body = json.loads(data) if data else None
    duration = (time.time() - start) * 1000  # en ms
    
    # Normaliser les noms de headers en minuscules pour compatibilité JS
    headers = {k.lower(): v for k, v in response.headers}
    
    return {
        'status': response.status_code,
        'headers': headers,
        'body': body,
        'duration': duration,
    }
