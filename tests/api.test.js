/**
 * Tests d'intégration pour l'API Calculatrice
 * Teste l'API comme un client externe avec de vraies requêtes HTTP
 */

const http = require("http");
const { requestHandler } = require("../src/server");
const { request } = require("./helpers/http");

describe("API /calculate", () => {
  let server;

  beforeAll((done) => {
    server = http.createServer(requestHandler);
    server.listen(0, "127.0.0.1", done);
  });

  afterAll((done) => {
    server.close(done);
  });

  // ========================================================================
  // Tests de performance
  // ========================================================================
  describe("Performance", () => {
    it("devrait répondre en moins de 100ms pour une requête valide", async () => {
      const { duration } = await request(
        server,
        "/calculate?operation=add&a=1&b=2",
      );
      expect(duration).toBeLessThan(100);
    });

    it("devrait répondre en moins de 100ms pour une requête en erreur 400", async () => {
      const { duration } = await request(
        server,
        "/calculate?operation=add&a=abc&b=3",
      );
      expect(duration).toBeLessThan(100);
    });
  });

  // ========================================================================
  // Tests des headers de réponse
  // ========================================================================
  describe("Headers de réponse", () => {
    it("devrait avoir Content-Type exact pour une réponse 200", async () => {
      const { headers } = await request(
        server,
        "/calculate?operation=add&a=1&b=2",
      );
      expect(headers["content-type"]).toBe("application/json; charset=utf-8");
    });

    it("devrait avoir Access-Control-Allow-Origin pour une réponse 200", async () => {
      const { headers } = await request(
        server,
        "/calculate?operation=add&a=1&b=2",
      );
      expect(headers["access-control-allow-origin"]).toBe("*");
    });

    it("devrait avoir Content-Type exact pour une réponse 400", async () => {
      const { headers } = await request(
        server,
        "/calculate?operation=add&a=abc&b=3",
      );
      expect(headers["content-type"]).toBe("application/json; charset=utf-8");
    });

    it("devrait avoir Content-Type exact pour une réponse 404", async () => {
      const { headers } = await request(server, "/unknown");
      expect(headers["content-type"]).toBe("application/json; charset=utf-8");
    });
  });

  // ========================================================================
  // Tests OPTIONS /calculate — preflight CORS
  // ========================================================================
  describe("OPTIONS /calculate — preflight CORS", () => {
    it("devrait retourner status 204", async () => {
      const { status } = await request(server, "/calculate", "OPTIONS");
      expect(status).toBe(204);
    });

    it("devrait avoir body null", async () => {
      const { body } = await request(server, "/calculate", "OPTIONS");
      expect(body).toBeNull();
    });

    it("devrait avoir Access-Control-Allow-Origin", async () => {
      const { headers } = await request(server, "/calculate", "OPTIONS");
      expect(headers["access-control-allow-origin"]).toBe("*");
    });

    it("devrait avoir Access-Control-Allow-Methods contenant GET", async () => {
      const { headers } = await request(server, "/calculate", "OPTIONS");
      expect(headers["access-control-allow-methods"]).toContain("GET");
    });
  });

  // ========================================================================
  // Tests GET /calculate — cas nominaux
  // ========================================================================
  describe("GET /calculate — cas nominaux", () => {
    it.each`
      operation     | a      | b     | expected
      ${"add"}      | ${2}   | ${3}  | ${5}
      ${"subtract"} | ${10}  | ${4}  | ${6}
      ${"multiply"} | ${6}   | ${7}  | ${42}
      ${"divide"}   | ${20}  | ${5}  | ${4}
      ${"add"}      | ${-5}  | ${-3} | ${-8}
      ${"subtract"} | ${-5}  | ${-3} | ${-2}
      ${"multiply"} | ${-3}  | ${-4} | ${12}
      ${"divide"}   | ${-10} | ${2}  | ${-5}
    `(
      "devrait retourner $operation($a, $b) = $expected",
      async ({ operation, a, b, expected }) => {
        const { status, body } = await request(
          server,
          `/calculate?operation=${operation}&a=${a}&b=${b}`,
        );
        expect(status).toBe(200);
        expect(body).toMatchObject({
          operation,
          a: Number(a),
          b: Number(b),
          result: expected,
        });
      },
    );

    it("devrait gérer la division décimale (10/3)", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=divide&a=10&b=3",
      );
      expect(status).toBe(200);
      expect(body.result).toBeCloseTo(3.3333333333);
    });

    it("devrait gérer les décimaux en query string (1.5 + 2.5)", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=add&a=1.5&b=2.5",
      );
      expect(status).toBe(200);
      expect(body.result).toBe(4);
    });

    it("devrait retourner un contrat JSON complet pour une réponse 200", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=multiply&a=3&b=4",
      );
      expect(status).toBe(200);
      expect(body).toHaveProperty("operation");
      expect(body).toHaveProperty("a");
      expect(body).toHaveProperty("b");
      expect(body).toHaveProperty("result");
      expect(body).not.toHaveProperty("error");
    });
  });

  // ========================================================================
  // Tests Méthode non autorisée
  // ========================================================================
  describe("Méthode non autorisée", () => {
    it("devrait retourner status 405 pour POST", async () => {
      const { status, body } = await request(server, "/calculate", "POST");
      expect(status).toBe(405);
      expect(body).toHaveProperty("error");
    });

    it("devrait avoir header Allow contenant GET pour POST", async () => {
      const { headers } = await request(server, "/calculate", "POST");
      expect(headers["allow"]).toContain("GET");
    });

    it("devrait retourner status 405 pour PUT", async () => {
      const { status } = await request(server, "/calculate", "PUT");
      expect(status).toBe(405);
    });

    it("devrait retourner status 405 pour DELETE", async () => {
      const { status } = await request(server, "/calculate", "DELETE");
      expect(status).toBe(405);
    });
  });

  // ========================================================================
  // Tests GET /calculate — erreurs 400
  // ========================================================================
  describe("GET /calculate — erreurs 400", () => {
    it("devrait retourner 400 si b est manquant", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=add&a=2",
      );
      expect(status).toBe(400);
      expect(body.error).toMatch(/Paramètres attendus/);
    });

    it("devrait retourner 400 si a est manquant", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=add&b=2",
      );
      expect(status).toBe(400);
      expect(body.error).toMatch(/Paramètres attendus/);
    });

    it("devrait retourner 400 si a est non numérique", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=add&a=abc&b=3",
      );
      expect(status).toBe(400);
      expect(body.error).toMatch(/doivent être des nombres/);
    });

    it("devrait retourner 400 si b est non numérique", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=add&a=3&b=abc",
      );
      expect(status).toBe(400);
      expect(body.error).toMatch(/doivent être des nombres/);
    });

    it("devrait retourner 400 pour division par zéro", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=divide&a=10&b=0",
      );
      expect(status).toBe(400);
      expect(body.error).toBe("Division par zéro impossible");
    });

    it("devrait retourner 400 pour opération inconnue", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=modulo&a=10&b=3",
      );
      expect(status).toBe(400);
      expect(body.error).toMatch(/Opération inconnue/);
    });

    it("devrait retourner 400 si operation est absent", async () => {
      const { status, body } = await request(server, "/calculate?a=5&b=3");
      expect(status).toBe(400);
      expect(body.error).toMatch(/Paramètres attendus/);
    });

    it("devrait retourner un contrat JSON erreur pour 400", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=add&a=2",
      );
      expect(status).toBe(400);
      expect(body).toHaveProperty("error");
      expect(body).not.toHaveProperty("result");
    });
  });

  // ========================================================================
  // Tests GET — autres routes
  // ========================================================================
  describe("GET — autres routes", () => {
    it("devrait retourner 404 pour route inconnue /unknown", async () => {
      const { status, body } = await request(server, "/unknown");
      expect(status).toBe(404);
      expect(body.error).toBe("Route introuvable.");
    });

    it("devrait retourner 404 pour racine /", async () => {
      const { status, body } = await request(server, "/");
      expect(status).toBe(404);
      expect(body).toHaveProperty("error");
    });

    it("devrait retourner 404 pour /calculate/ avec slash final", async () => {
      const { status, body } = await request(server, "/calculate/");
      expect(status).toBe(404);
      expect(body).toHaveProperty("error");
    });
  });

  // ========================================================================
  // Tests Cas limites — edge cases
  // ========================================================================
  describe("Cas limites — edge cases", () => {
    it("devrait gérer les très grandes valeurs (1e308)", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=add&a=1e308&b=1e308",
      );
      expect(status).toBe(200);
      // Le résultat peut être null, "Infinity" ou Infinity
      expect([null, "Infinity", Infinity]).toContain(body.result);
    });

    it("devrait gérer a=-0 correctement", async () => {
      const { status, body } = await request(
        server,
        "/calculate?operation=add&a=-0&b=5",
      );
      expect(status).toBe(200);
      expect(body.result).toBe(5);
      expect(body.a).toBe(0); // JSON.stringify(-0) produit "0"
    });
  });
});
