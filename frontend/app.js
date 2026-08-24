// Same-origin by default — the backend serves this frontend directly.
// Override only if you're running the frontend from a separate static server.
const API_URL = '';

const emailInput = document.getElementById('emailInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const charCount = document.getElementById('charCount');
const statusBanner = document.getElementById('statusBanner');
const resultPanel = document.getElementById('resultPanel');
const resultContent = document.getElementById('resultContent');
const sampleButtons = document.getElementById('sampleButtons');
const riskGauge = document.getElementById('riskGauge');
const riskGaugeFill = document.getElementById('riskGaugeFill');
const riskGaugeLabel = document.getElementById('riskGaugeLabel');

const MAX_CHARS = 20000;

const SAMPLE_EMAILS = [
  {
    label: 'Phishing',
    text: `From: Chase Bank Alerts <alerts@chase-secure-verify.com>
To: you@example.com
Subject: Unusual Sign-in Attempt Detected - Verify Now

Dear Valued Customer,

We noticed a sign-in attempt to your account from an unrecognized device in Lagos, Nigeria. If this wasn't you, your account may be compromised.

To secure your account, please verify your identity immediately by clicking the link below:

http://chase-secure-verify.com/account/confirm?id=88213

Failure to verify within 12 hours will result in temporary suspension of your account.

Thank you,
Chase Online Security Team`,
  },
  {
    label: 'Suspicious',
    text: `From: Billing <billing@vendor-invoices-support.net>
To: accounts@example.com
Subject: Invoice #4471 - Payment Overdue

Hello,

Attached is invoice #4471 for services rendered last month, which is now 5 days overdue. Please review and process payment at your earliest convenience to avoid a late fee.

If you have already paid, please disregard this notice.

Regards,
Accounts Receivable

(Attachment: Invoice_4471.zip)`,
  },
  {
    label: 'Legit',
    text: `From: Priya Sharma <priya.sharma@yeatoday.org>
To: you@yeatoday.org
Subject: Notes from today's grant committee call

Hi team,

Thanks for jumping on the call today. A few quick notes:

- We'll submit the youth mentorship grant application by next Friday.
- Rohit is finalizing the budget section — ping him if you need the latest numbers.
- Next check-in is Thursday at 3pm, same Zoom link as usual.

Let me know if I missed anything.

Best,
Priya`,
  },
];

SAMPLE_EMAILS.forEach((sample) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `sample-btn sample-btn-${sample.label.toLowerCase()}`;
  btn.textContent = sample.label;
  btn.addEventListener('click', () => {
    emailInput.value = sample.text;
    emailInput.dispatchEvent(new Event('input'));
    emailInput.focus();
  });
  sampleButtons.appendChild(btn);
});

emailInput.addEventListener('input', () => {
  const len = emailInput.value.length;
  charCount.textContent = `${len.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`;
  charCount.classList.toggle('over-limit', len > MAX_CHARS);
});

analyzeBtn.addEventListener('click', analyzeEmail);

function showStatus(message, kind) {
  statusBanner.textContent = message;
  statusBanner.className = `status-banner ${kind}`;
}

function hideStatus() {
  statusBanner.className = 'status-banner hidden';
}

function verdictClass(markdown) {
  const match = markdown.match(/\*\*(Likely Phishing|Suspicious|Likely Safe)\*\*/i);
  if (!match) return '';
  const verdict = match[1].toLowerCase();
  if (verdict === 'likely phishing') return 'verdict-danger';
  if (verdict === 'suspicious') return 'verdict-warning';
  return 'verdict-safe';
}

function extractRiskScore(markdown) {
  const match = markdown.match(/Risk score:\s*(\d{1,3})\s*\/\s*100/i);
  if (!match) return null;
  return Math.max(0, Math.min(100, parseInt(match[1], 10)));
}

function updateRiskGauge(markdown) {
  const score = extractRiskScore(markdown);
  if (score === null) {
    riskGauge.classList.add('hidden');
    return;
  }

  const tier = score >= 67 ? 'danger' : score >= 34 ? 'warning' : 'safe';
  riskGaugeFill.style.width = `${score}%`;
  riskGaugeFill.className = `risk-gauge-fill risk-gauge-${tier}`;
  riskGaugeLabel.textContent = `${score} / 100`;
  riskGauge.classList.remove('hidden');
}

async function analyzeEmail() {
  const emailText = emailInput.value.trim();

  if (!emailText) {
    showStatus('Paste an email first.', 'error');
    return;
  }
  if (emailText.length > MAX_CHARS) {
    showStatus(`Email is too long — max ${MAX_CHARS.toLocaleString()} characters.`, 'error');
    return;
  }

  hideStatus();
  resultPanel.classList.add('hidden');
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  showStatus('Analyzing email...', 'info');

  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailText }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    hideStatus();
    resultContent.innerHTML = marked.parse(data.content);
    resultContent.className = verdictClass(data.content);
    updateRiskGauge(data.content);
    resultPanel.classList.remove('hidden');
  } catch (err) {
    showStatus(`Error: ${err.message}`, 'error');
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze Email';
  }
}
