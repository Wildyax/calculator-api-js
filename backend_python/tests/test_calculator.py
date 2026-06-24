import pytest
from src.calculator import Calculator


@pytest.fixture
def calculator():
    """Crée une instance de Calculator pour chaque test."""
    return Calculator()


class TestAdd:
    """Tests pour la méthode add."""
    
    @pytest.mark.parametrize("a, b, expected", [
        (2, 3, 5),
        (-5, -3, -8),
        (-5, 3, -2),
        (7, 0, 7),
    ])
    def test_add(self, calculator, a, b, expected):
        """Devrait retourner a + b = expected."""
        assert calculator.add(a, b) == expected
    
    def test_add_decimal(self, calculator):
        """Devrait retourner 0.1 + 0.2 ≈ 0.3."""
        assert calculator.add(0.1, 0.2) == pytest.approx(0.3)


class TestSubtract:
    """Tests pour la méthode subtract."""
    
    @pytest.mark.parametrize("a, b, expected", [
        (10, 4, 6),
        (3, 10, -7),
        (5, 0, 5),
        (-5, -3, -2),
    ])
    def test_subtract(self, calculator, a, b, expected):
        """Devrait retourner a - b = expected."""
        assert calculator.subtract(a, b) == expected
    
    def test_subtract_decimal(self, calculator):
        """Devrait retourner 0.3 - 0.1 ≈ 0.2."""
        assert calculator.subtract(0.3, 0.1) == pytest.approx(0.2)


class TestMultiply:
    """Tests pour la méthode multiply."""
    
    @pytest.mark.parametrize("a, b, expected", [
        (6, 7, 42),
        (0, 999, 0),
        (-3, -4, 12),
        (3, -4, -12),
    ])
    def test_multiply(self, calculator, a, b, expected):
        """Devrait retourner a * b = expected."""
        assert calculator.multiply(a, b) == expected
    
    def test_multiply_decimal(self, calculator):
        """Devrait retourner 0.1 * 0.2 ≈ 0.02."""
        assert calculator.multiply(0.1, 0.2) == pytest.approx(0.02)


class TestDivide:
    """Tests pour la méthode divide."""
    
    @pytest.mark.parametrize("a, b, expected", [
        (20, 5, 4),
        (0, 5, 0),
        (-10, -2, 5),
        (-7, 2, -3.5),
    ])
    def test_divide(self, calculator, a, b, expected):
        """Devrait retourner a / b = expected."""
        assert calculator.divide(a, b) == expected
    
    def test_divide_decimal(self, calculator):
        """Devrait retourner 10 / 3 ≈ 3.333."""
        assert calculator.divide(10, 3) == pytest.approx(3.3333333333)
    
    def test_divide_by_zero(self, calculator):
        """Devrait lever une exception pour division par zéro."""
        with pytest.raises(ValueError, match="Division par zéro impossible"):
            calculator.divide(10, 0)
