const crypto = require('crypto');
const roles = ["PM", "SE", "ARCHITECT", "MAINTAINER", "QA", "DEV", "TESTER"];
const secret = "upf-cloud-native-2026";

console.log("# Role Token Generator for CI/CD");
roles.forEach(role => {
    const token = crypto.createHmac('sha256', secret).update(role).digest('hex').substring(0, 16);
    console.log(`export ACTIVE_ROLE=${role} && export ACTIVE_TOKEN=${token}`);
});
