const fs = require('fs');
const path = require('path');
const dbPath = path.join(process.cwd(), 'lib', 'data.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const products = ['AUTO', 'MRH', 'RCPRO'];
const statuses = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'CLOSED'];
const advisors = data.users.filter(u => u.role === 'ADVISOR').map(u => u.id);

const firstNames = ['Alice','Bob','Charlie','David','Eve','Frank','Grace','Hugo','Ivy','Jack'];
const lastNames = ['Smith','Dupont','Martin','Miller','Brown','Lee','Dubois','Kelly','Boss','Plant'];

const fiches = [];

for (let i = 1; i <= 30; i++) {
  const isAssigned = Math.random() > 0.3;
  let status;
  let adv = null;
  
  if (isAssigned) {
    status = statuses[1 + Math.floor(Math.random() * 3)];
    adv = advisors[Math.floor(Math.random() * advisors.length)];
  } else {
    status = 'NEW';
  }

  const start = new Date('2025-01-01T00:00:00Z').getTime();
  const end = new Date('2026-02-26T23:59:59Z').getTime();
  const dateObj = new Date(start + Math.random() * (end - start));

  fiches.push({
    id: i.toString(),
    clientName: `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`,
    phone: "06" + Math.floor(10000000 + Math.random() * 90000000),
    email: `client${i}@example.com`,
    product: products[Math.floor(Math.random() * products.length)],
    status: status,
    advisorId: adv,
    type: "Standard",
    garanties: ["Base", "Premium Option"],
    prime: 100 + Math.floor(Math.random() * 900),
    createdAt: dateObj.toISOString()
  });
}

// Sort descending by creation date
fiches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

data.fiches = fiches;
fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Seed successful. Generated 30 fiches.');
