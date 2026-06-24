import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Tests unitaires de la logique métier (équivalent de calculator.test.js).
 * On teste la classe Calculator directement, sans passer par HTTP.
 */
class CalculatorTest {

    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }

    // @CsvSource équivalent JUnit de `it.each` côté Jest : une ligne = un cas.
    @ParameterizedTest(name = "{0} + {1} = {2}")
    @CsvSource({
            "2, 3, 5",
            "-5, -3, -8",
            "-5, 3, -2",
            "7, 0, 7"
    })
    void add(double a, double b, double expected) {
        assertEquals(expected, calculator.add(a, b));
    }

    @Test
    void addFloatingPoint() {
        // 3e argument = tolérance (équivalent de toBeCloseTo)
        assertEquals(0.3, calculator.add(0.1, 0.2), 1e-9);
    }

    @ParameterizedTest(name = "{0} - {1} = {2}")
    @CsvSource({
            "10, 4, 6",
            "3, 10, -7",
            "5, 0, 5",
            "-5, -3, -2"
    })
    void subtract(double a, double b, double expected) {
        assertEquals(expected, calculator.subtract(a, b));
    }

    @ParameterizedTest(name = "{0} * {1} = {2}")
    @CsvSource({
            "6, 7, 42",
            "0, 999, 0",
            "-3, -4, 12",
            "3, -4, -12"
    })
    void multiply(double a, double b, double expected) {
        assertEquals(expected, calculator.multiply(a, b));
    }

    @ParameterizedTest(name = "{0} / {1} = {2}")
    @CsvSource({
            "20, 5, 4",
            "0, 5, 0",
            "-10, -2, 5",
            "-7, 2, -3.5"
    })
    void divide(double a, double b, double expected) {
        assertEquals(expected, calculator.divide(a, b));
    }

    @Test
    void divideNonExact() {
        // 10 / 3 = 3.3333...
        assertEquals(3.3333, calculator.divide(10, 3), 1e-3);
    }

    @Test
    void divideByZeroThrows() {
        ArithmeticException ex = assertThrows(
                ArithmeticException.class,
                () -> calculator.divide(10, 0));
        assertEquals("Division par zéro impossible", ex.getMessage());
    }
}
