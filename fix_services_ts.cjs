const fs = require('fs');

function fixServices() {
  // Fix communityService
  let commContent = fs.readFileSync('src/services/communityService.ts', 'utf8');
  if (!commContent.includes('getDiscussionsPaginated')) {
    const discussionsPaginated = `
  async getDiscussionsPaginated(limitCount: number = 10, lastDocSnap: any = null): Promise<{ data: Discussion[], lastDoc: any }> {
    let q = query(collection(db, FIREBASE_ROUTES.DISCUSSIONS), orderBy('date', 'desc'), limit(limitCount));
    if (lastDocSnap) {
      q = query(q, startAfter(lastDocSnap));
    }
    const querySnapshot = await getDocs(q);
    const data: Discussion[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Discussion);
    });
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null };
  },`;
    commContent = commContent.replace('async getDiscussionById(', discussionsPaginated + '\n\n  async getDiscussionById(');
  }
  
  if (commContent.includes('orderBy')) {
    if (!commContent.includes("orderBy('date'")) {
       // Just to be safe, remove orderBy from imports if it's not used
       commContent = commContent.replace('orderBy, ', '').replace(', orderBy', '');
    }
  }
  fs.writeFileSync('src/services/communityService.ts', commContent, 'utf8');

  // Fix articleService
  let artContent = fs.readFileSync('src/services/articleService.ts', 'utf8');
  artContent = artContent.replace(', orderBy', '');
  fs.writeFileSync('src/services/articleService.ts', artContent, 'utf8');
}

fixServices();
