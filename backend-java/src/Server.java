import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class Server {

    static final int PORT = 3000;
    static final Calculator calculator = new Calculator();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", Server::handle);
        server.setExecutor(null);
        server.start();
        System.out.println("Serveur Java démarré sur http://localhost:" + PORT);
    }

    static void handle(HttpExchange exchange) throws IOException {
        // 1. En-têtes CORS sur TOUTES les réponses
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        String method = exchange.getRequestMethod();

        // 2. OPTIONS (preflight) -> 204 vide
        if (method.equals("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return;
        }

        // 3. Méthode != GET -> 405 + en-tête Allow
        if (!method.equals("GET")) {
            exchange.getResponseHeaders().set("Allow", "GET, OPTIONS");
            sendJson(exchange, 405, "{\"error\":\"Méthode non autorisée. Utiliser GET.\"}");
            return;
        }

        // 4. Route != /calculate -> 404
        URI uri = exchange.getRequestURI();
        if (!uri.getPath().equals("/calculate")) {
            sendJson(exchange, 404, "{\"error\":\"Route introuvable.\"}");
            return;
        }

        Map<String, String> q = parseQuery(uri.getRawQuery());
        String operation = q.get("operation");
        String aRaw = q.get("a");
        String bRaw = q.get("b");

        // a) Paramètre manquant -> 400
        if (operation == null || aRaw == null || bRaw == null) {
            sendJson(exchange, 400, "{\"error\":\"Paramètres attendus : operation, a, b\"}");
            return;
        }

        // b) Conversion numérique -> 400 si a ou b n'est pas un nombre
        double a, b;
        try {
            a = Double.parseDouble(aRaw);
            b = Double.parseDouble(bRaw);
        } catch (NumberFormatException e) {
            sendJson(exchange, 400, "{\"error\":\"Les paramètres a et b ne sont ps des nombres\"}");
            return;
        }

        // c) Calcul selon l'opération
        double result;
        try {
            switch (operation) {
                case "add":      result = calculator.add(a, b);      break;
                case "subtract": result = calculator.subtract(a, b); break;
                case "multiply": result = calculator.multiply(a, b); break;
                case "divide":   result = calculator.divide(a, b);   break;
                default:
                    sendJson(exchange, 400, "{\"error\":\"Opération inconnue. Utiliser : add, subtract, multiply, divide\"}");
                    return;
            }
        } catch (ArithmeticException e) {
            // ex. division par zéro
            sendJson(exchange, 400, "{\"error\":\"" + e.getMessage() + "\"}");
            return;
        }

        // d) Succès -> 200
        String json = "{\"operation\":\"" + operation + "\""
                + ",\"a\":" + formatNumber(a)
                + ",\"b\":" + formatNumber(b)
                + ",\"result\":" + formatNumber(result) + "}";
        sendJson(exchange, 200, json);
    }

    // Écrit le corps JSON avec le bon statut et ferme l'échange
    static void sendJson(HttpExchange exchange, int status, String json) throws IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, body.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    //Format le nombre proprement pour eviter d'avoir une dissonance entre 5.0 et 5
    static String formatNumber(double d) {
        if (d == Math.rint(d) && !Double.isInfinite(d)) {
            return Long.toString((long) d);
        }
        return Double.toString(d);
    }

    /** Parse "operation=add&a=2&b=3" en Map. Retourne une map vide si null. */
    static Map<String, String> parseQuery(String raw) {
        Map<String, String> map = new HashMap<>();
        if (raw == null || raw.isEmpty()) return map;
        for (String pair : raw.split("&")) {
            int i = pair.indexOf('=');
            if (i > 0) {
                String key = java.net.URLDecoder.decode(pair.substring(0, i), StandardCharsets.UTF_8);
                String val = java.net.URLDecoder.decode(pair.substring(i + 1), StandardCharsets.UTF_8);
                map.put(key, val);
            }
        }
        return map;
    }
}

class Calculator {
    double add(double a, double b) {
        System.out.println("Opération ADD : " + a + "+" + b + "=" + (a + b) + ".");
        return a + b; }
    double subtract(double a, double b) { 
        System.out.println("Opération SUBSTRACT : " + a + "-" + b + "=" + (a - b) + ".");
        return a - b; }
    double multiply(double a, double b) { 
        System.out.println("Opération MULTIPLY : " + a + "*" + b + "=" + (a * b) + ".");
        return a * b; }

    double divide(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("Division par zéro impossible");
        }
        System.out.println("Opération DIVIDE : " + a + "/" + b + "=" + (a / b) + ".");
        return a / b;
    }
}
