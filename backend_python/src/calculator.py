class Calculator:
    def add(self, a: float, b: float) -> float:
        """Additionne deux nombres."""
        return a + b

    def subtract(self, a: float, b: float) -> float:
        """Soustrait deux nombres."""
        return a - b

    def multiply(self, a: float, b: float) -> float:
        """Multiplie deux nombres."""
        return a * b

    def divide(self, a: float, b: float) -> float:
        """Divise deux nombres.
        
        Lève une exception si b est zéro.
        """
        if b == 0:
            raise ValueError("Division par zéro impossible")
        return a / b
