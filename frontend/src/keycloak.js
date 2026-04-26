import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:9090/",
  realm: "mini-project",
  clientId: "mini-client",
});

export default keycloak;

