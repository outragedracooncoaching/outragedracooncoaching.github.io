/**
 * Outraged Racoon Coaching: contact form backend (Google Apps Script web app).
 * Not published by Jekyll (apps-script is in _config.yml `exclude:`).
 *
 * What it does: the /contact-form/ page POSTs JSON here. This script appends a
 * row to the "Enquiries" sheet and emails you, with Reply-To set to the enquirer.
 *
 * DEPLOY (one-off, about 5 minutes):
 *  1. Create a new Google Sheet (e.g. "Coaching enquiries") in the Google account
 *     that should receive the emails.
 *  2. In the sheet: Extensions > Apps Script. Delete the sample code, paste this
 *     whole file in, and save.
 *  3. Deploy > New deployment > cog icon > Web app.
 *       Description:      Contact form
 *       Execute as:       Me
 *       Who has access:   Anyone
 *     Click Deploy and approve the permissions it asks for (Sheets + send email as you).
 *     Google will warn the app is unverified: Advanced > Go to (project) is expected,
 *     it's your own script.
 *  4. Copy the Web app URL (ends in /exec) and paste it into _config.yml:
 *       contact_form_endpoint: "https://script.google.com/macros/s/XXXX/exec"
 *     Rebuild / push the site.
 *  5. Test: send yourself a message from /contact-form/. You should get an email
 *     and a new row in the "Enquiries" tab.
 *
 * EDITING LATER: after changing this code, Deploy > Manage deployments > pencil >
 * Version: New version > Deploy. That keeps the same URL. ("New deployment" makes
 * a new URL, which you'd then have to paste into _config.yml again.)
 */

var SHEET_NAME = 'Enquiries';
var HEADERS = ['Timestamp', 'Name', 'Email', 'Message', 'Package', 'From', 'Page'];
var MIN_ELAPSED_MS = 3000;
var LIMITS = { name: 200, email: 320, message: 5000, package: 40, from: 60, page: 300 };
var PACKAGES = {
  hour: 'The Decisive Hour',
  campaign: 'The Campaign',
  advisory: 'The Advisory',
  course: 'Course invoice'
};

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Bots: pretend it worked so they learn nothing.
    if (data.website) return json_({ ok: true });
    if (!(Number(data.elapsed) >= MIN_ELAPSED_MS)) return json_({ ok: true });

    var name = clean_(data.name, LIMITS.name);
    var email = clean_(data.email, LIMITS.email);
    var message = clean_(data.message, LIMITS.message);
    var pkg = clean_(data.package, LIMITS.package);
    var from = clean_(data.from, LIMITS.from);
    var page = clean_(data.page, LIMITS.page);

    if (!name || !message) return json_({ ok: false, error: 'missing' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json_({ ok: false, error: 'email' });
    if (String(data.message || '').length > LIMITS.message) return json_({ ok: false, error: 'too_long' });

    var pkgLabel = PACKAGES[pkg] || '';

    var sheet = getSheet_();
    sheet.appendRow([new Date(), name, email, message, pkgLabel || 'Not sure yet', from, page].map(safeCell_));

    var subject = 'Coaching enquiry: ' + name + ' (' + (pkgLabel || from || 'direct') + ')';
    var body = [
      'Name: ' + name,
      'Email: ' + email,
      'Package: ' + (pkgLabel || 'Not sure yet'),
      'From: ' + (from || 'direct') + (page ? ' on ' + page : ''),
      '',
      message,
      '',
      '(Hit reply to answer them directly.)'
    ].join('\n');

    MailApp.sendEmail({
      to: Session.getEffectiveUser().getEmail(),
      replyTo: email,
      subject: subject,
      body: body,
      name: 'Coaching contact form'
    });

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false });
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clean_(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

// Stop anything that looks like a spreadsheet formula from running in the sheet.
function safeCell_(value) {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
