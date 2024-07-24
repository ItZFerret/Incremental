// Game state
const game = {
    gold: 0,
    workers: 0,
    technology: 0,
    totalGoldMined: 0,
    totalWorkersHired: 0,
    totalTechResearched: 0,
    goldPerClick: 1,
    goldPerWorker: 0.1,
    researchCost: 50,
    workerCost: 10,
    upgrades: [
        { id: 'betterTools', name: 'Better Tools', cost: 100, baseCost: 100, purchased: 0, effect: () => game.goldPerClick *= 1.5, icon: 'fa-wrench' },
        { id: 'efficientWorkers', name: 'Efficient Workers', cost: 250, baseCost: 250, purchased: 0, effect: () => game.goldPerWorker *= 1.5, icon: 'fa-user-clock' },
        { id: 'advancedMining', name: 'Advanced Mining', cost: 500, baseCost: 500, purchased: 0, effect: () => game.goldPerClick *= 2, icon: 'fa-hard-hat' },
    ],
    achievements: [
        { id: 'firstGold', name: 'First Gold', condition: () => game.totalGoldMined >= 1, icon: 'fa-coin' },
        { id: 'hundredGold', name: 'Gold Rush', condition: () => game.totalGoldMined >= 100, icon: 'fa-coins' },
        { id: 'thousandGold', name: 'Gold Tycoon', condition: () => game.totalGoldMined >= 1000, icon: 'fa-piggy-bank' },
        { id: 'millionGold', name: 'Gold Empire', condition: () => game.totalGoldMined >= 1000000, icon: 'fa-gem' },
        { id: 'tenWorkers', name: 'Small Company', condition: () => game.totalWorkersHired >= 10, icon: 'fa-users' },
        { id: 'fiftyWorkers', name: 'Growing Business', condition: () => game.totalWorkersHired >= 50, icon: 'fa-building' },
        { id: 'hundredWorkers', name: 'Corporate Empire', condition: () => game.totalWorkersHired >= 100, icon: 'fa-city' },
        { id: 'fiveTech', name: 'Innovator', condition: () => game.totalTechResearched >= 5, icon: 'fa-lightbulb' },
        { id: 'tenTech', name: 'Tech Pioneer', condition: () => game.totalTechResearched >= 10, icon: 'fa-microchip' },
        { id: 'twentyTech', name: 'Future Visionary', condition: () => game.totalTechResearched >= 20, icon: 'fa-rocket' },
        { id: 'firstUpgrade', name: 'Upgrader', condition: () => game.upgrades.some(u => u.purchased > 0), icon: 'fa-arrow-up' },
        { id: 'fiveUpgrades', name: 'Upgrade Enthusiast', condition: () => game.upgrades.reduce((sum, u) => sum + u.purchased, 0) >= 5, icon: 'fa-arrow-up-right-dots' },
        { id: 'tenUpgrades', name: 'Upgrade Master', condition: () => game.upgrades.reduce((sum, u) => sum + u.purchased, 0) >= 10, icon: 'fa-arrow-up-short-wide' },
        { id: 'firstSkill', name: 'Skilled', condition: () => Object.values(game.skillTree).some(branch => branch.some(skill => skill.purchased)), icon: 'fa-graduation-cap' },
        { id: 'branchMaster', name: 'Branch Master', condition: () => Object.values(game.skillTree).some(branch => branch.every(skill => skill.purchased)), icon: 'fa-certificate' },
        { id: 'skillMaster', name: 'Skill Master', condition: () => Object.values(game.skillTree).every(branch => branch.every(skill => skill.purchased)), icon: 'fa-award' },
    ],
    skillTree: {
        mining: [
            { id: 'mining1', name: 'Basic Mining', cost: 5, effect: () => game.goldPerClick *= 1.2, icon: 'fa-pickaxe', purchased: false },
            { id: 'mining2', name: 'Advanced Mining', cost: 15, effect: () => game.goldPerClick *= 1.5, icon: 'fa-gem', purchased: false, requires: 'mining1' },
            { id: 'mining3', name: 'Expert Mining', cost: 30, effect: () => game.goldPerClick *= 2, icon: 'fa-mountain', purchased: false, requires: 'mining2' },
        ],
        labor: [
            { id: 'labor1', name: 'Basic Labor', cost: 5, effect: () => game.goldPerWorker *= 1.2, icon: 'fa-hard-hat', purchased: false },
            { id: 'labor2', name: 'Efficient Labor', cost: 15, effect: () => game.goldPerWorker *= 1.5, icon: 'fa-users-cog', purchased: false, requires: 'labor1' },
            { id: 'labor3', name: 'Automated Labor', cost: 30, effect: () => game.goldPerWorker *= 2, icon: 'fa-robot', purchased: false, requires: 'labor2' },
        ],
        research: [
            { id: 'research1', name: 'Basic Research', cost: 10, effect: () => game.researchCost *= 0.9, icon: 'fa-flask', purchased: false },
            { id: 'research2', name: 'Advanced Research', cost: 20, effect: () => game.researchCost *= 0.8, icon: 'fa-atom', purchased: false, requires: 'research1' },
            { id: 'research3', name: 'Breakthrough', cost: 40, effect: () => { game.researchCost *= 0.7; game.goldPerClick *= 1.5; game.goldPerWorker *= 1.5; }, icon: 'fa-lightbulb', purchased: false, requires: 'research2' },
        ],
    },
    statistics: {
        goldPerSecond: 0,
        peakGoldPerSecond: 0,
        totalClicks: 0,
        peakWorkers: 0,
        techResearchedThisPrestige: 0,
    },
    graphData: {
        labels: [],
        goldPerSecond: [],
        totalGold: [],
        workers: [],
        technology: [],
    },
};

// DOM elements
const goldElement = document.getElementById('gold');
const workersElement = document.getElementById('workers');
const technologyElement = document.getElementById('technology');
const mineGoldButton = document.getElementById('mineGold');
const hireWorkerButton = document.getElementById('hireWorker');
const researchTechButton = document.getElementById('researchTech');
const upgradesList = document.getElementById('upgradesList');
const achievementsList = document.getElementById('achievementsList');
const totalGoldMinedElement = document.getElementById('totalGoldMined');
const totalWorkersHiredElement = document.getElementById('totalWorkersHired');
const totalTechResearchedElement = document.getElementById('totalTechResearched');
const darkModeToggle = document.getElementById('darkModeToggle');

// Update display
function updateDisplay() {
    goldElement.textContent = Math.floor(game.gold);
    workersElement.textContent = game.workers;
    technologyElement.textContent = game.technology;
    totalGoldMinedElement.textContent = Math.floor(game.totalGoldMined);
    totalWorkersHiredElement.textContent = game.totalWorkersHired;
    totalTechResearchedElement.textContent = game.totalTechResearched;
    hireWorkerButton.innerHTML = `<i class="fas fa-user-plus"></i> Hire Worker (${game.workerCost} Gold)`;
    researchTechButton.innerHTML = `<i class="fas fa-flask"></i> Research Technology (${game.researchCost} Gold)`;
}

// Mine gold
mineGoldButton.addEventListener('click', () => {
    game.gold += game.goldPerClick;
    game.totalGoldMined += game.goldPerClick;
    game.statistics.totalClicks++;
    updateDisplay();
    checkAchievements();
});

// Hire worker
hireWorkerButton.addEventListener('click', () => {
    if (game.gold >= game.workerCost) {
        game.gold -= game.workerCost;
        game.workers++;
        game.totalWorkersHired++;
        game.workerCost = Math.floor(game.workerCost * 1.1);
        updateDisplay();
        checkAchievements();
    }
});

// Research technology
researchTechButton.addEventListener('click', () => {
    if (game.gold >= game.researchCost) {
        game.gold -= game.researchCost;
        game.technology++;
        game.totalTechResearched++;
        game.statistics.techResearchedThisPrestige++;
        game.researchCost = Math.floor(game.researchCost * 1.5);
        updateDisplay();
        createSkillTree();
        checkAchievements();
    }
});

// Worker production loop
setInterval(() => {
    const production = game.workers * game.goldPerWorker;
    game.gold += production;
    game.totalGoldMined += production;
    game.statistics.goldPerSecond = production;
    game.statistics.peakGoldPerSecond = Math.max(game.statistics.peakGoldPerSecond, production);
    game.statistics.peakWorkers = Math.max(game.statistics.peakWorkers, game.workers);
    updateDisplay();
    updateDetailedStats();
    updateGraphData();
    updateCharts();
    checkAchievements();
}, 1000);

// Create upgrades
function createUpgrades() {
    upgradesList.innerHTML = '';
    game.upgrades.forEach(upgrade => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        const nameSpan = document.createElement('span');
        nameSpan.innerHTML = `<i class="fas ${upgrade.icon}"></i> ${upgrade.name}`;
        const button = document.createElement('button');
        button.className = 'btn btn-sm btn-outline-primary';
        button.innerHTML = `<i class="fas fa-coins"></i> ${upgrade.cost}`;
        button.addEventListener('click', () => buyUpgrade(upgrade));
        li.appendChild(nameSpan);
        li.appendChild(button);
        upgradesList.appendChild(li);
    });
}

// Buy upgrade
function buyUpgrade(upgrade) {
    if (game.gold >= upgrade.cost) {
        game.gold -= upgrade.cost;
        upgrade.effect();
        upgrade.purchased++;
        upgrade.cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.purchased));
        updateDisplay();
        createUpgrades();
        checkAchievements();
    }
}

// Create skill tree
function createSkillTree() {
    const skillTreeElement = document.getElementById('skillTree');
    skillTreeElement.innerHTML = '';

    for (const [branch, skills] of Object.entries(game.skillTree)) {
        const branchElement = document.createElement('div');
        branchElement.className = 'card mb-3';
        branchElement.innerHTML = `
            <div class="card-header">${branch.charAt(0).toUpperCase() + branch.slice(1)}</div>
            <ul class="list-group list-group-flush"></ul>
        `;

        skills.forEach(skill => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            const nameSpan = document.createElement('span');
            nameSpan.innerHTML = `<i class="fas ${skill.icon}"></i> ${skill.name}`;
            const button = document.createElement('button');
            button.className = 'btn btn-sm btn-outline-primary';
            button.innerHTML = `<i class="fas fa-microscope"></i> ${skill.cost}`;
            button.disabled = skill.purchased || 
                              (skill.requires && !game.skillTree[branch].find(s => s.id === skill.requires).purchased) ||
                              game.technology < skill.cost;
            button.addEventListener('click', () => buySkill(branch, skill));
            li.appendChild(nameSpan);
            li.appendChild(button);
            branchElement.querySelector('ul').appendChild(li);
        });

        skillTreeElement.appendChild(branchElement);
    }
}

// Buy skill
function buySkill(branch, skill) {
    if (game.technology >= skill.cost && !skill.purchased) {
        game.technology -= skill.cost;
        skill.purchased = true;
        skill.effect();
        updateDisplay();
        createSkillTree();
        checkAchievements();
    }
}

// Check achievements
function checkAchievements() {
    game.achievements.forEach(achievement => {
        if (achievement.condition() && !document.getElementById(achievement.id)) {
            const li = document.createElement('li');
            li.id = achievement.id;
            li.className = 'list-group-item list-group-item-success d-flex align-items-center';
            li.innerHTML = `<i class="fas ${achievement.icon} me-2"></i> ${achievement.name}`;
            achievementsList.appendChild(li);
            
            showNotification(`<i class="fas ${achievement.icon}"></i> Achievement Unlocked: ${achievement.name}`);
        }
    });
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.innerHTML = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Update detailed statistics
function updateDetailedStats() {
    const statsElement = document.getElementById('detailedStats');
    statsElement.innerHTML = `
        <li class="list-group-item">Gold per second: ${game.statistics.goldPerSecond.toFixed(2)}</li>
        <li class="list-group-item">Peak gold per second: ${game.statistics.peakGoldPerSecond.toFixed(2)}</li>
        <li class="list-group-item">Total clicks: ${game.statistics.totalClicks}</li>
        <li class="list-group-item">Peak workers: ${game.statistics.peakWorkers}</li>
        <li class="list-group-item">Technology researched this prestige: ${game.statistics.techResearchedThisPrestige}</li>
        <li class="list-group-item">Gold per click: ${game.goldPerClick.toFixed(2)}</li>
        <li class="list-group-item">Gold per worker: ${game.goldPerWorker.toFixed(2)}</li>
    `;
}

// Update graph data
function updateGraphData() {
    const now = new Date();
    game.graphData.labels.push(now.toLocaleTimeString());
    game.graphData.goldPerSecond.push(game.statistics.goldPerSecond);
    game.graphData.totalGold.push(game.gold);
    game.graphData.workers.push(game.workers);
    game.graphData.technology.push(game.technology);

    // Keep only the last 60 data points
    if (game.graphData.labels.length > 60) {
        game.graphData.labels.shift();
        game.graphData.goldPerSecond.shift();
        game.graphData.totalGold.shift();
        game.graphData.workers.shift();
        game.graphData.technology.shift();
    }
}

// Create and update charts
let productionChart, resourceChart;

function createCharts() {
    const ctxProduction = document.getElementById('productionChart').getContext('2d');
    productionChart = new Chart(ctxProduction, {
        type: 'line',
        data: {
            labels: game.graphData.labels,
            datasets: [{
                label: 'Gold per Second',
                data: game.graphData.goldPerSecond,
                borderColor: 'gold',
                fill: false
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Gold Production Over Time'
            }
        }
    });

    const ctxResources = document.getElementById('resourceChart').getContext('2d');
    resourceChart = new Chart(ctxResources, {
        type: 'line',
        data: {
            labels: game.graphData.labels,
            datasets: [{
                label: 'Total Gold',
                data: game.graphData.totalGold,
                borderColor: 'gold',
                fill: false
            }, {
                label: 'Workers',
                data: game.graphData.workers,
                borderColor: 'blue',
                fill: false
            }, {
                label: 'Technology',
                data: game.graphData.technology,
                borderColor: 'green',
                fill: false
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Resources Over Time'
            }
        }
    });
}

function updateCharts() {
    productionChart.update();
    resourceChart.update();
}

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});

// Initialize game
createUpgrades();
createSkillTree();
createCharts();
updateDisplay();
updateDetailedStats();