const http = require("http");
const url = require("url");
const Calculator = require("./calculator");

const calculator = new Calculator();
const PORT = 3000;

/**
 * Gestionnaire de requêtes HTTP
 * @param {object} req - Objet Request
 * @param {object} res - Objet Response
 */
function requestHandler(req, res) {
  // 1. Positionner les headers CORS sur toutes les réponses
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // 2. Si méthode OPTIONS → répondre 204 vide et stopper
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 3. Si méthode ≠ GET → répondre 405 avec header Allow
  if (req.method !== "GET") {
    res.writeHead(405, { Allow: "GET, OPTIONS" });
    res.end(JSON.stringify({ error: "Méthode non autorisée. Utiliser GET." }));
    return;
  }

  // 4. Si pathname ≠ /calculate → répondre 404
  const parsedUrl = url.parse(req.url || "", true);
  const pathname = parsedUrl.pathname;

  if (pathname !== "/calculate") {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Route introuvable." }));
    return;
  }

  // 5. Si operation, a ou b sont absents de la query string → répondre 400
  const { operation, a, b } = parsedUrl.query;

  if (operation === undefined || a === undefined || b === undefined) {
    res.writeHead(400);
    res.end(JSON.stringify({ error: "Paramètres attendus : operation, a, b" }));
    return;
  }

  // 6. Convertir a et b en Number ; si NaN → répondre 400
  const numA = Number(a);
  const numB = Number(b);

  if (isNaN(numA) || isNaN(numB)) {
    res.writeHead(400);
    res.end(
      JSON.stringify({
        error: "Les paramètres a et b doivent être des nombres.",
      }),
    );
    return;
  }

  // 7. Exécuter l'opération via Calculator dans un try/catch
  try {
    let result;
    const op = String(operation);

    switch (op) {
      case "add":
        result = calculator.add(numA, numB);
        break;
      case "subtract":
        result = calculator.subtract(numA, numB);
        break;
      case "multiply":
        result = calculator.multiply(numA, numB);
        break;
      case "divide":
        result = calculator.divide(numA, numB);
        break;
      default:
        // 8. Si opération inconnue → répondre 400
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error:
              "Opération inconnue. Utiliser : add, subtract, multiply, divide",
          }),
        );
        return;
    }

    // 9. Répondre 200 avec { operation, a, b, result }
    res.writeHead(200);
    res.end(
      JSON.stringify({
        operation: op,
        a: numA,
        b: numB,
        result: result,
      }),
    );
  } catch (error) {
    // Gérer les erreurs (comme division par zéro)
    res.writeHead(400);
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Créer le serveur
const server = http.createServer(requestHandler);

// Exporter pour les tests
module.exports = { requestHandler, server, PORT };

// Démarrer le serveur uniquement si le fichier est exécuté directement
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
}
