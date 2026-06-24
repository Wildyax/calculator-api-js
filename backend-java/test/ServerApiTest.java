import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Tests d'intégration de l'API (équivalent de api.test.js).
 * On démarre un vrai serveur HTTP sur un port libre (port 0 = aléatoire)
 * et on l'interroge comme un client externe. Couvre tout le contrat
 * décrit dans ../API_CONTRACT.md.
 */
class ServerApiTest {

    private static HttpServer server;
    private static final HttpClient client = HttpClient.newHttpClient();
    private static String baseUrl;

    @BeforeAll
    static void startServer() throws Exception {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/", Server::handle);
        server.start();
        baseUrl = "http://localhost:" + server.getAddress().getPort();
    }

    @AfterAll
    static void stopServer() {
        server.stop(0);
    }

    // ----- Helpers -----------------------------------------------------

    /** Envoie une requête avec la méthode HTTP voulue et renvoie la réponse. */
    private HttpResponse<String> send(String method, String path) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(baseUrl + path))
                .method(method, HttpRequest.BodyPublishers.noBody())
                .build();
        return client.send(req, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path) throws Exception {
        return send("GET", path);
    }

    private String header(HttpResponse<String> res, String name) {
        return res.headers().firstValue(name).orElse("");
    }

    // ========================================================================
    // GET /calculate — cas nominaux (200)
    // ========================================================================

    @ParameterizedTest(name = "{0}({1}, {2}) = {3}")
    @CsvSource({
            "add, 2, 3, 5",
            "subtract, 10, 4, 6",
            "multiply, 6, 7, 42",
            "divide, 20, 5, 4",
            "add, -5, -3, -8",
            "subtract, -5, -3, -2",
            "multiply, -3, -4, 12",
            "divide, -10, 2, -5"
    })
    void nominalCases_return200WithExactJson(String op, String a, String b, String expected) throws Exception {
        HttpResponse<String> res = get("/calculate?operation=" + op + "&a=" + a + "&b=" + b);
        assertEquals(200, res.statusCode());
        assertEquals(
                "{\"operation\":\"" + op + "\",\"a\":" + a + ",\"b\":" + b + ",\"result\":" + expected + "}",
                res.body());
    }

    @Test
    void decimalInputs_areHandled() throws Exception {
        HttpResponse<String> res = get("/calculate?operation=add&a=1.5&b=2.5");
        assertEquals(200, res.statusCode());
        assertEquals("{\"operation\":\"add\",\"a\":1.5,\"b\":2.5,\"result\":4}", res.body());
    }

    @Test
    void nonExactDivision_isHandled() throws Exception {
        HttpResponse<String> res = get("/calculate?operation=divide&a=10&b=3");
        assertEquals(200, res.statusCode());
        assertTrue(res.body().contains("\"result\":3.333"), "body = " + res.body());
    }

    // ========================================================================
    // Erreurs 400
    // ========================================================================

    @ParameterizedTest(name = "param manquant: {0}")
    @ValueSource(strings = {
            "/calculate?operation=add&a=2",   // b manquant
            "/calculate?operation=add&b=2",   // a manquant
            "/calculate?a=5&b=3"              // operation manquant
    })
    void missingParam_returns400(String path) throws Exception {
        HttpResponse<String> res = get(path);
        assertEquals(400, res.statusCode());
        assertTrue(res.body().contains("Paramètres attendus"), "body = " + res.body());
    }

    @ParameterizedTest(name = "non numérique: {0}")
    @ValueSource(strings = {
            "/calculate?operation=add&a=abc&b=3",
            "/calculate?operation=add&a=3&b=abc"
    })
    void nonNumeric_returns400(String path) throws Exception {
        HttpResponse<String> res = get(path);
        assertEquals(400, res.statusCode());
        assertTrue(res.body().contains("doivent être des nombres"), "body = " + res.body());
    }

    @Test
    void unknownOperation_returns400() throws Exception {
        HttpResponse<String> res = get("/calculate?operation=modulo&a=10&b=3");
        assertEquals(400, res.statusCode());
        assertTrue(res.body().contains("Opération inconnue"), "body = " + res.body());
    }

    @Test
    void divideByZero_returns400() throws Exception {
        HttpResponse<String> res = get("/calculate?operation=divide&a=1&b=0");
        assertEquals(400, res.statusCode());
        assertEquals("{\"error\":\"Division par zéro impossible\"}", res.body());
    }

    // ========================================================================
    // Méthode non autorisée (405) et preflight (204)
    // ========================================================================

    @ParameterizedTest(name = "{0} -> 405")
    @ValueSource(strings = {"POST", "PUT", "DELETE"})
    void nonGetMethods_return405(String method) throws Exception {
        HttpResponse<String> res = send(method, "/calculate");
        assertEquals(405, res.statusCode());
    }

    @Test
    void post_hasAllowHeaderWithGet() throws Exception {
        HttpResponse<String> res = send("POST", "/calculate");
        assertTrue(header(res, "Allow").contains("GET"), "Allow = " + header(res, "Allow"));
    }

    @Test
    void options_returns204Empty() throws Exception {
        HttpResponse<String> res = send("OPTIONS", "/calculate");
        assertEquals(204, res.statusCode());
        assertTrue(res.body().isEmpty(), "body devrait être vide");
    }

    // ========================================================================
    // Routes inconnues (404)
    // ========================================================================

    @ParameterizedTest(name = "route {0} -> 404")
    @ValueSource(strings = {"/unknown", "/", "/calculate/"})
    void unknownRoutes_return404(String path) throws Exception {
        HttpResponse<String> res = get(path);
        assertEquals(404, res.statusCode());
    }

    @Test
    void unknownRoute_hasExactMessage() throws Exception {
        HttpResponse<String> res = get("/wrong");
        assertEquals("{\"error\":\"Route introuvable.\"}", res.body());
    }

    // ========================================================================
    // En-têtes (CORS + Content-Type) présents sur toutes les réponses
    // ========================================================================

    @ParameterizedTest(name = "Content-Type sur {0}")
    @ValueSource(strings = {
            "/calculate?operation=add&a=1&b=2",   // 200
            "/calculate?operation=add&a=x&b=2",   // 400
            "/unknown"                            // 404
    })
    void contentTypeHeader_isJsonUtf8(String path) throws Exception {
        HttpResponse<String> res = get(path);
        assertEquals("application/json; charset=utf-8", header(res, "Content-Type"));
    }

    @Test
    void corsHeaders_arePresent() throws Exception {
        HttpResponse<String> res = get("/calculate?operation=add&a=1&b=1");
        assertEquals("*", header(res, "Access-Control-Allow-Origin"));
        assertTrue(header(res, "Access-Control-Allow-Methods").contains("GET"));
    }
}
