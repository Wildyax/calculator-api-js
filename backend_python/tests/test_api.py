"""Tests d'intégration pour l'API Calculatrice.
Teste l'API comme un client externe avec de vraies requêtes HTTP.
"""
import pytest
from src.server import app
from tests.helpers.http import request


@pytest.fixture
def client():
    """Crée un client de test Flask."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


# ========================================================================
# Tests de performance
# ========================================================================
class TestPerformance:
    """Tests de performance."""
    
    def test_response_time_valid_request(self, client):
        """Devrait répondre en moins de 100ms pour une requête valide."""
        result = request(client, "/calculate?operation=add&a=1&b=2")
        assert result['duration'] < 100
    
    def test_response_time_error_400(self, client):
        """Devrait répondre en moins de 100ms pour une requête en erreur 400."""
        result = request(client, "/calculate?operation=add&a=abc&b=3")
        assert result['duration'] < 100


# ========================================================================
# Tests des headers de réponse
# ========================================================================
class TestResponseHeaders:
    """Tests des headers de réponse."""
    
    def test_content_type_200(self, client):
        """Devrait avoir Content-Type exact pour une réponse 200."""
        result = request(client, "/calculate?operation=add&a=1&b=2")
        assert 'content-type' in result['headers']
        assert 'application/json' in result['headers']['content-type']
    
    def test_access_control_allow_origin_200(self, client):
        """Devrait avoir Access-Control-Allow-Origin pour une réponse 200."""
        result = request(client, "/calculate?operation=add&a=1&b=2")
        assert 'access-control-allow-origin' in result['headers']
        assert result['headers']['access-control-allow-origin'] == '*'
    
    def test_content_type_400(self, client):
        """Devrait avoir Content-Type exact pour une réponse 400."""
        result = request(client, "/calculate?operation=add&a=abc&b=3")
        assert 'content-type' in result['headers']
        assert 'application/json' in result['headers']['content-type']
    
    def test_content_type_404(self, client):
        """Devrait avoir Content-Type exact pour une réponse 404."""
        result = request(client, "/unknown")
        assert 'content-type' in result['headers']
        assert 'application/json' in result['headers']['content-type']


# ========================================================================
# Tests OPTIONS /calculate — preflight CORS
# ========================================================================
class TestOptionsCalculate:
    """Tests OPTIONS /calculate — preflight CORS."""
    
    def test_options_status_204(self, client):
        """Devrait retourner status 204."""
        result = request(client, "/calculate", "OPTIONS")
        assert result['status'] == 204
    
    def test_options_body_null(self, client):
        """Devrait avoir body null."""
        result = request(client, "/calculate", "OPTIONS")
        assert result['body'] is None
    
    def test_options_access_control_allow_origin(self, client):
        """Devrait avoir Access-Control-Allow-Origin."""
        result = request(client, "/calculate", "OPTIONS")
        assert 'access-control-allow-origin' in result['headers']
        assert result['headers']['access-control-allow-origin'] == '*'
    
    def test_options_access_control_allow_methods(self, client):
        """Devrait avoir Access-Control-Allow-Methods contenant GET."""
        result = request(client, "/calculate", "OPTIONS")
        assert 'access-control-allow-methods' in result['headers']
        assert 'GET' in result['headers']['access-control-allow-methods']


# ========================================================================
# Tests GET /calculate — cas nominaux
# ========================================================================
class TestGetCalculateNominal:
    """Tests GET /calculate — cas nominaux."""
    
    @pytest.mark.parametrize("operation, a, b, expected", [
        ("add", 2, 3, 5),
        ("subtract", 10, 4, 6),
        ("multiply", 6, 7, 42),
        ("divide", 20, 5, 4),
        ("add", -5, -3, -8),
        ("subtract", -5, -3, -2),
        ("multiply", -3, -4, 12),
        ("divide", -10, 2, -5),
    ])
    def test_operations(self, client, operation, a, b, expected):
        """Devrait retourner operation(a, b) = expected."""
        result = request(client, f"/calculate?operation={operation}&a={a}&b={b}")
        assert result['status'] == 200
        assert result['body']['operation'] == operation
        assert result['body']['a'] == a
        assert result['body']['b'] == b
        assert result['body']['result'] == expected
    
    def test_division_decimal(self, client):
        """Devrait gérer la division décimale (10/3)."""
        result = request(client, "/calculate?operation=divide&a=10&b=3")
        assert result['status'] == 200
        assert result['body']['result'] == pytest.approx(3.3333333333)
    
    def test_decimals_in_query_string(self, client):
        """Devrait gérer les décimaux en query string (1.5 + 2.5)."""
        result = request(client, "/calculate?operation=add&a=1.5&b=2.5")
        assert result['status'] == 200
        assert result['body']['result'] == 4.0
    
    def test_full_json_contract(self, client):
        """Devrait retourner un contrat JSON complet pour une réponse 200."""
        result = request(client, "/calculate?operation=multiply&a=3&b=4")
        assert result['status'] == 200
        assert 'operation' in result['body']
        assert 'a' in result['body']
        assert 'b' in result['body']
        assert 'result' in result['body']
        assert 'error' not in result['body']


# ========================================================================
# Tests Méthode non autorisée
# ========================================================================
class TestMethodNotAllowed:
    """Tests Méthode non autorisée."""
    
    def test_post_status_405(self, client):
        """Devrait retourner status 405 pour POST."""
        result = request(client, "/calculate", "POST")
        assert result['status'] == 405
        assert 'error' in result['body']
    
    def test_post_allow_header(self, client):
        """Devrait avoir header Allow contenant GET pour POST."""
        result = request(client, "/calculate", "POST")
        assert 'allow' in result['headers']
        assert 'GET' in result['headers']['allow']
    
    def test_put_status_405(self, client):
        """Devrait retourner status 405 pour PUT."""
        result = request(client, "/calculate", "PUT")
        assert result['status'] == 405
    
    def test_delete_status_405(self, client):
        """Devrait retourner status 405 pour DELETE."""
        result = request(client, "/calculate", "DELETE")
        assert result['status'] == 405


# ========================================================================
# Tests GET /calculate — erreurs 400
# ========================================================================
class TestGetCalculateErrors:
    """Tests GET /calculate — erreurs 400."""
    
    def test_missing_b(self, client):
        """Devrait retourner 400 si b est manquant."""
        result = request(client, "/calculate?operation=add&a=2")
        assert result['status'] == 400
        assert 'Paramètres attendus' in result['body']['error']
    
    def test_missing_a(self, client):
        """Devrait retourner 400 si a est manquant."""
        result = request(client, "/calculate?operation=add&b=2")
        assert result['status'] == 400
        assert 'Paramètres attendus' in result['body']['error']
    
    def test_non_numeric_a(self, client):
        """Devrait retourner 400 si a est non numérique."""
        result = request(client, "/calculate?operation=add&a=abc&b=3")
        assert result['status'] == 400
        assert 'doivent être des nombres' in result['body']['error']
    
    def test_non_numeric_b(self, client):
        """Devrait retourner 400 si b est non numérique."""
        result = request(client, "/calculate?operation=add&a=3&b=abc")
        assert result['status'] == 400
        assert 'doivent être des nombres' in result['body']['error']
    
    def test_divide_by_zero(self, client):
        """Devrait retourner 400 pour division par zéro."""
        result = request(client, "/calculate?operation=divide&a=10&b=0")
        assert result['status'] == 400
        assert result['body']['error'] == "Division par zéro impossible"
    
    def test_unknown_operation(self, client):
        """Devrait retourner 400 pour opération inconnue."""
        result = request(client, "/calculate?operation=modulo&a=10&b=3")
        assert result['status'] == 400
        assert 'Opération inconnue' in result['body']['error']
    
    def test_missing_operation(self, client):
        """Devrait retourner 400 si operation est absent."""
        result = request(client, "/calculate?a=5&b=3")
        assert result['status'] == 400
        assert 'Paramètres attendus' in result['body']['error']
    
    def test_error_contract(self, client):
        """Devrait retourner un contrat JSON erreur pour 400."""
        result = request(client, "/calculate?operation=add&a=2")
        assert result['status'] == 400
        assert 'error' in result['body']
        assert 'result' not in result['body']


# ========================================================================
# Tests GET — autres routes
# ========================================================================
class TestOtherRoutes:
    """Tests GET — autres routes."""
    
    def test_unknown_route(self, client):
        """Devrait retourner 404 pour route inconnue /unknown."""
        result = request(client, "/unknown")
        assert result['status'] == 404
        assert result['body']['error'] == "Route introuvable."
    
    def test_root_route(self, client):
        """Devrait retourner 404 pour racine /."""
        result = request(client, "/")
        assert result['status'] == 404
        assert 'error' in result['body']
    
    def test_calculate_with_trailing_slash(self, client):
        """Devrait retourner 404 pour /calculate/ avec slash final."""
        result = request(client, "/calculate/")
        assert result['status'] == 404
        assert 'error' in result['body']


# ========================================================================
# Tests Cas limites — edge cases
# ========================================================================
class TestEdgeCases:
    """Tests Cas limites — edge cases."""
    
    def test_very_large_values(self, client):
        """Devrait gérer les très grandes valeurs (1e308)."""
        result = request(client, "/calculate?operation=add&a=1e308&b=1e308")
        assert result['status'] == 200
        # Le résultat peut être null, "Infinity" ou float('inf')
        # Flask convertit float('inf') en "Infinity" dans JSON
        assert result['body']['result'] in [None, "Infinity", float('inf')]
    
    def test_negative_zero(self, client):
        """Devrait gérer a=-0 correctement."""
        result = request(client, "/calculate?operation=add&a=-0&b=5")
        assert result['status'] == 200
        assert result['body']['result'] == 5.0
        # En JSON, -0 devient 0
        assert result['body']['a'] == 0.0
