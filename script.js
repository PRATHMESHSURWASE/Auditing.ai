
    const PRICING = {
        cursor: {
            free:     { price: 0,  label: 'Free',     limit: '2,000 completions/mo' },
            pro:      { price: 20, label: 'Pro',      limit: 'Unlimited completions' },
            business: { price: 40, label: 'Business', limit: 'Unlimited + admin controls' }
        },
        github_copilot: {
            individual:  { price: 10, label: 'Individual' },
            business:    { price: 19, label: 'Business' },
            enterprise:  { price: 39, label: 'Enterprise' }
        },
        chatgpt: {
            free:       { price: 0,  label: 'Free' },
            plus:       { price: 20, label: 'Plus' },
            team:       { price: 30, label: 'Team' },
            enterprise: { price: 60, label: 'Enterprise' }
        },
        claude: {
            free: { price: 0,  label: 'Free' },
            pro:  { price: 20, label: 'Pro' },
            team: { price: 30, label: 'Team' }
        },
        notion_ai: {
            plus:      { price: 10, label: 'Plus' },
            business:  { price: 15, label: 'Business' },
            enterprise:{ price: 20, label: 'Enterprise' }
        },
        midjourney: {
            basic:    { price: 10,  label: 'Basic' },
            standard: { price: 30,  label: 'Standard' },
            pro:      { price: 60,  label: 'Pro' },
            mega:     { price: 120, label: 'Mega' }
        }
    };

    const TOOL_LABELS = {
        cursor: 'Cursor',
        github_copilot: 'GitHub Copilot',
        chatgpt: 'ChatGPT',
        claude: 'Claude',
        notion_ai: 'Notion AI',
        midjourney: 'Midjourney'
    };

    function auditTool(tool, teamSize) {
        const toolPricing = PRICING[tool.name];
        const currentCost = tool.cost || (tool.seats * 20);
        let recommendation = '';
        let recommendedCost = currentCost;
        let savings = 0;
        let reason = '';

        if (!toolPricing) {
            return {
                toolName: TOOL_LABELS[tool.name] || tool.name,
                currentCost,
                recommendedCost: currentCost,
                savings: 0,
                recommendedPlan: tool.plan,
                reason: 'No pricing data available for comparison.',
                savingsPercent: 0
            };
        }

        const seats = tool.seats || 1;

        if (tool.name === 'cursor') {
            if (seats <= 3 && tool.plan === 'business') {
                recommendedCost = seats * PRICING.cursor.pro.price;
                recommendation = 'Cursor Pro';
                reason = `With only ${seats} seats, Cursor Pro ($20/seat) covers unlimited completions. Business tier admin controls are not needed at this team size.`;
            } else if (seats >= 10) {
                recommendedCost = seats * PRICING.cursor.business.price;
                recommendation = 'Cursor Business';
                reason = `At ${seats} seats, Business tier gives you admin controls and usage analytics worth the extra cost.`;
            } else {
                recommendedCost = currentCost;
                recommendation = tool.plan;
                reason = 'Your current plan is well-matched to your team size.';
            }
        } else if (tool.name === 'github_copilot') {
            if (seats <= 5 && (tool.plan === 'business' || tool.plan === 'enterprise')) {
                recommendedCost = seats * PRICING.github_copilot.individual.price;
                recommendation = 'Individual (×' + seats + ')';
                reason = `For ${seats} developers, individual plans at $10/seat save money vs Business ($19/seat).`;
            } else if (seats > 20 && tool.plan !== 'enterprise') {
                recommendedCost = seats * PRICING.github_copilot.enterprise.price;
                recommendation = 'Enterprise';
                reason = `At ${seats}+ developers, Enterprise adds security and audit logs worth the cost.`;
            } else {
                recommendedCost = currentCost;
                recommendation = tool.plan;
                reason = 'Your current plan is appropriate for your team size.';
            }
        } else if (tool.name === 'chatgpt') {
            if (seats > 5 && tool.plan === 'plus') {
                recommendedCost = seats * PRICING.chatgpt.team.price;
                recommendation = 'Team';
                reason = `With ${seats} users on Plus, switching to Team adds higher limits and admin controls at better value.`;
            } else if (seats <= 2 && (tool.plan === 'team' || tool.plan === 'enterprise')) {
                recommendedCost = seats * PRICING.chatgpt.plus.price;
                recommendation = 'Plus (×' + seats + ')';
                reason = `For ${seats} users, individual Plus plans are cheaper than Team tier.`;
            } else {
                recommendedCost = currentCost;
                recommendation = tool.plan;
                reason = 'Your current plan matches your usage pattern well.';
            }
        } else if (tool.name === 'claude') {
            if (seats <= 2 && tool.plan === 'team') {
                recommendedCost = seats * PRICING.claude.pro.price;
                recommendation = 'Pro (×' + seats + ')';
                reason = `Team plan is designed for 3+ users. At ${seats} seats, individual Pro plans cost less.`;
            } else if (tool.cost > seats * PRICING.claude.pro.price) {
                recommendedCost = seats * PRICING.claude.pro.price;
                recommendation = 'Claude Pro (×' + seats + ')';
                reason = `Claude Pro is $20/seat. For ${seats} seats the correct price is $${seats * 20}/mo — you are overpaying by $${tool.cost - (seats * 20)}/mo.`;
            } else {
                recommendedCost = currentCost;
                recommendation = tool.plan;
                reason = 'Your Claude plan is well-suited to your team size.';
            }
        } else {
            recommendedCost = currentCost;
            recommendation = tool.plan;
            reason = 'Your current plan appears appropriately sized.';
        }

        savings = Math.max(0, currentCost - recommendedCost);
        const savingsPercent = currentCost > 0 ? Math.round((savings / currentCost) * 100) : 0;

        return {
            toolName: TOOL_LABELS[tool.name] || tool.name,
            currentCost,
            recommendedCost,
            savings,
            recommendedPlan: recommendation || tool.plan,
            reason,
            savingsPercent
        };
    }

    function renderToolCard(result) {
        const hasSavings = result.savings > 0;
        return `
            <div class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h3 class="font-semibold text-gray-900">${result.toolName}</h3>
                        <p class="text-xs text-gray-400 mt-0.5">Current: ${result.currentPlan || result.recommendedPlan}</p>
                    </div>
                    <span class="${hasSavings ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'} text-xs font-semibold px-3 py-1 rounded-full">
                        ${hasSavings ? `Save $${result.savings}/mo` : 'Optimized ✓'}
                    </span>
                </div>
                <div class="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div class="bg-gray-50 rounded-xl p-3">
                        <p class="text-xs text-gray-400 mb-1">Current</p>
                        <p class="font-bold text-gray-900">$${result.currentCost}</p>
                    </div>
                    <div class="bg-blue-50 rounded-xl p-3">
                        <p class="text-xs text-blue-400 mb-1">Recommended</p>
                        <p class="font-bold text-blue-700">$${result.recommendedCost}</p>
                    </div>
                    <div class="${hasSavings ? 'bg-green-50' : 'bg-gray-50'} rounded-xl p-3">
                        <p class="text-xs ${hasSavings ? 'text-green-400' : 'text-gray-400'} mb-1">Savings</p>
                        <p class="font-bold ${hasSavings ? 'text-green-700' : 'text-gray-500'}">$${result.savings}</p>
                    </div>
                </div>
                ${hasSavings ? `
                <div class="mb-3">
                    <div class="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Savings potential</span>
                        <span>${result.savingsPercent}%</span>
                    </div>
                    <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div class="saving-bar h-full bg-green-500 rounded-full" style="width: 0%" data-width="${result.savingsPercent}%"></div>
                    </div>
                </div>
                <div class="bg-blue-50 rounded-xl px-4 py-3">
                    <p class="text-xs font-medium text-blue-800">Switch to: <span class="font-bold">${result.recommendedPlan}</span></p>
                    <p class="text-xs text-blue-600 mt-1">${result.reason}</p>
                </div>` : `
                <div class="bg-gray-50 rounded-xl px-4 py-3">
                    <p class="text-xs text-gray-500">${result.reason}</p>
                </div>`}
            </div>
        `;
    }

    async function generateSummary(auditData, results, totalSavings) {
        const toolSummary = results.map(r =>
            `${r.toolName}: paying $${r.currentCost}/mo, could save $${r.savings}/mo by switching to ${r.recommendedPlan}`
        ).join('; ');

        const prompt = `You are a financial advisor specializing in SaaS spend optimization.
A startup called "${auditData.company}" with ${auditData.teamSize} employees is spending on AI tools.
Here is their audit: ${toolSummary}.
Total potential monthly savings: $${totalSavings}.
Write a concise, personalized 80-100 word audit summary. Be specific about their company name, biggest waste, and top 2 actionable recommendations. Use a professional but direct tone. Do not use bullet points.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDNlLGyZbJ5AcFGuPKSCzYq5OwkQbr0AlA`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    function captureEmail() {
        const email = document.getElementById('emailInput').value;
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email.');
            return;
        }
        const emails = JSON.parse(localStorage.getItem('capturedEmails') || '[]');
        emails.push({ email, date: new Date().toISOString() });
        localStorage.setItem('capturedEmails', JSON.stringify(emails));
        document.getElementById('emailSuccess').classList.remove('hidden');
    }

    function copyShareLink() {
        const auditData = localStorage.getItem('auditData');
        const encoded = btoa(auditData);
        const url = `${window.location.origin}/results.html?audit=${encoded}`;
        navigator.clipboard.writeText(url).then(() => {
            document.getElementById('copySuccess').classList.remove('hidden');
            setTimeout(() => document.getElementById('copySuccess').classList.add('hidden'), 3000);
        });
    }

    window.onload = async function () {
        const raw = localStorage.getItem('auditData');
        if (!raw) {
            window.location.href = 'index.html';
            return;
        }

        const auditData = JSON.parse(raw);
        const tools = auditData.tools || [];

        const results = tools.map(t => {
            const r = auditTool(t, auditData.teamSize);
            r.currentPlan = t.plan;
            return r;
        });

        const totalSpend = results.reduce((s, r) => s + r.currentCost, 0);
        const totalSavings = results.reduce((s, r) => s + r.savings, 0);
        const optimizedSpend = totalSpend - totalSavings;

        document.getElementById('companyName').textContent = auditData.company;
        document.getElementById('totalSpend').textContent = `$${totalSpend}/mo`;
        document.getElementById('totalSavings').textContent = `$${totalSavings}/mo`;
        document.getElementById('optimizedSpend').textContent = `$${optimizedSpend}/mo`;

        if (totalSavings > 500) {
            document.getElementById('consultationCTA').classList.remove('hidden');
        }

        const breakdown = document.getElementById('toolBreakdown');
        breakdown.innerHTML = results.map(r => renderToolCard(r)).join('');

        setTimeout(() => {
            document.querySelectorAll('.saving-bar').forEach(bar => {
                bar.style.width = bar.dataset.width;
            });
        }, 300);

        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('resultsMain').classList.remove('hidden');

        try {
            const summary = await generateSummary(auditData, results, totalSavings);
            document.getElementById('summaryLoading').classList.add('hidden');
            document.getElementById('summaryText').classList.remove('hidden');
            document.getElementById('summaryText').textContent = summary;
        } catch (err) {
            document.getElementById('summaryLoading').classList.add('hidden');
            document.getElementById('summaryError').classList.remove('hidden');
        }
    };