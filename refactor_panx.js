const fs = require('fs');
let content = fs.readFileSync('client/src/pages/EcosystemPage.tsx', 'utf-8');

// 1. Find the bounds of the map function
const mapStart = "                filteredPosts.map(post => {";
const mapEnd = "                })";
let mapStartIndex = content.indexOf(mapStart);

// We need to find the correct mapEnd.
let braceCount = 0;
let mapEndIndex = -1;
let started = false;

for (let i = mapStartIndex; i < content.length; i++) {
  if (content[i] === '{') {
    braceCount++;
    started = true;
  } else if (content[i] === '}') {
    braceCount--;
  }

  if (started && braceCount === 0) {
    // Found the closing brace for the map function
    mapEndIndex = i + 1; // include the brace
    // usually it's "})"
    if (content[i+1] === ')') {
        mapEndIndex = i + 2;
    }
    break;
  }
}

const mapBlock = content.substring(mapStartIndex, mapEndIndex);

// 2. Extract formatTimestamp, getInitials, getAvatarColor, getAuthorCategory
// They are defined as const name = (...) => { ... }
function extractFunction(name) {
    const search = `  const ${name} = `;
    const startIdx = content.indexOf(search);
    if (startIdx === -1) return '';
    let bc = 0;
    let st = false;
    let endIdx = -1;
    for (let i = startIdx; i < content.length; i++) {
        if (content[i] === '{') { bc++; st = true; }
        else if (content[i] === '}') { bc--; }
        if (st && bc === 0) {
            endIdx = i + 1;
            break;
        }
    }
    if (endIdx !== -1) {
        // also get the trailing semicolon if any
        if (content[endIdx] === ';') endIdx++;
        const funcStr = content.substring(startIdx, endIdx);
        // remove from content
        content = content.replace(funcStr + '\n', '');
        content = content.replace(funcStr, '');
        // unindent
        return funcStr.split('\n').map(l => l.replace(/^  /, '')).join('\n');
    }
    return '';
}

const formatTimestampStr = extractFunction('formatTimestamp');
const getInitialsStr = extractFunction('getInitials');
const getAvatarColorStr = extractFunction('getAvatarColor');
const getAuthorCategoryStr = extractFunction('getAuthorCategory');

// 3. Prepare PanXPostItem component
let postItemInner = mapBlock
    .replace('filteredPosts.map(post => {', '')
    .replace(/}\)$/, '');

// Add loading="lazy" to imgs, preload="metadata" to videos
postItemInner = postItemInner.replace(/<img /g, '<img loading="lazy" ');
postItemInner = postItemInner.replace(/<video /g, '<video preload="metadata" ');

const panxPostItemComponent = `
const PanXPostItem = React.memo(({ 
  post, 
  user, 
  navigate, 
  handleFollowToggle, 
  handleDeletePost, 
  handleLikeToggle, 
  setActiveReplyPostId, 
  activeReplyPostId, 
  handleRepostToggle, 
  setPosts, 
  replyText, 
  setReplyText, 
  handlePostReply, 
  setFullscreenMedia,
  api,
  message
}: any) => {
${postItemInner}
});
`;

// 4. Create the new map call
const newMapCall = `                filteredPosts.map(post => (
                  <PanXPostItem 
                    key={post.id}
                    post={post}
                    user={user}
                    navigate={navigate}
                    handleFollowToggle={handleFollowToggle}
                    handleDeletePost={handleDeletePost}
                    handleLikeToggle={handleLikeToggle}
                    setActiveReplyPostId={setActiveReplyPostId}
                    activeReplyPostId={activeReplyPostId}
                    handleRepostToggle={handleRepostToggle}
                    setPosts={setPosts}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handlePostReply={handlePostReply}
                    setFullscreenMedia={setFullscreenMedia}
                    api={api}
                    message={message}
                  />
                ))`;

// Replace mapBlock in content
content = content.replace(mapBlock, newMapCall);

// Insert helpers and component before EcosystemPage definition
const insertIdx = content.indexOf('const EcosystemPage: React.FC = () => {');

const toInsert = `
${formatTimestampStr}
${getInitialsStr}
${getAvatarColorStr}
${getAuthorCategoryStr}

${panxPostItemComponent}

`;

content = content.substring(0, insertIdx) + toInsert + content.substring(insertIdx);

fs.writeFileSync('client/src/pages/EcosystemPage.tsx', content, 'utf-8');
console.log('Refactoring complete');
