const fs = require('fs');
const glob = require('glob');

const files = [
  'client/src/components/SubmissionForm.tsx',
  'client/src/components/EngagementModal.tsx',
  'client/src/components/FrequencyScanForm.tsx',
  'client/src/components/Message.tsx',
  'client/src/components/VideoCallContainer.tsx',
  'client/src/components/LiveBroadcastContainer.tsx',
  'client/src/pages/ProfilePage.tsx',
  'client/src/pages/Services.tsx',
  'client/src/pages/QsiTvPage.tsx',
  'client/src/pages/LabPage.tsx',
  'client/src/pages/InvoicesPage.tsx',
  'client/src/pages/AdminDashboard.tsx',
  'client/src/pages/InboxPage.tsx',
  'client/src/pages/OnboardingPage.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace catch blocks. 
    // We want to match: catch (VAR) { ... message.error("Fallback string") ... }
    // Or just find message.error("...") and if it's inside a catch block, replace it.
    
    // A simpler approach:
    // Find all occurrences of `message.error("something")` or `message.error('something')` or `message.error(`something`)`
    // And replace them with `message.error((err as any)?.response?.data?.error || (err as any)?.response?.data?.message || "something")`
    // But we need to know the error variable name.
    
    // Let's use a regex to replace `catch (VAR)` with `catch (err)` so it's uniform.
    // Wait, let's just make it simpler.
    
    let modified = content.replace(/catch\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*\{([\s\S]*?)message\.error\((['"`].*?['"`])\)/g, 
      (match, errVar, between, msgString) => {
        return `catch (${errVar}) {${between}message.error(${errVar}?.response?.data?.error || ${errVar}?.response?.data?.message || ${msgString})`;
      }
    );
    
    if (modified !== content) {
      fs.writeFileSync(file, modified, 'utf8');
      console.log('Updated', file);
    }
  }
});
