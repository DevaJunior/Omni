const fs = require('fs');

function addPagination(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // communityService.ts edits
  if (filePath.includes('communityService.ts')) {
    content = content.replace(
      "import { collection, getDocs, doc, getDoc, arrayUnion, setDoc, increment, deleteDoc } from 'firebase/firestore';",
      "import { collection, getDocs, doc, getDoc, arrayUnion, setDoc, increment, deleteDoc, query, limit, startAfter, orderBy } from 'firebase/firestore';"
    );
    
    // getDiscussionsPaginated
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
    
    // getProjectsPaginated (using 'name' order or something else? Wait, mock projects might not have a date. 
    // Let's orderBy('__name__') if no date exists, or simply orderBy 'status' then '__name__'. 
    // Usually orderBy date is best, let's use createdAt or fallback to __name__)
    const projectsPaginated = `
  async getProjectsPaginated(limitCount: number = 10, lastDocSnap: any = null): Promise<{ data: Project[], lastDoc: any }> {
    let q = query(collection(db, FIREBASE_ROUTES.PROJECTS), limit(limitCount));
    if (lastDocSnap) {
      q = query(q, startAfter(lastDocSnap));
    }
    const querySnapshot = await getDocs(q);
    const data: Project[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Project);
    });
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null };
  },`;

    content = content.replace('async getDiscussionsById(', discussionsPaginated + '\n\n  async getDiscussionById(');
    content = content.replace('async getDiscussions():', projectsPaginated + '\n\n  async getDiscussions():');
  }

  if (filePath.includes('articleService.ts')) {
    content = content.replace(
      "import { collection, getDocs, doc, getDoc, query, limit, updateDoc, increment, Timestamp } from 'firebase/firestore';",
      "import { collection, getDocs, doc, getDoc, query, limit, updateDoc, increment, Timestamp, startAfter, orderBy } from 'firebase/firestore';"
    );

    const articlesPaginated = `
  async getArticlesPaginated(limitCount: number = 10, lastDocSnap: any = null): Promise<{ data: Article[], lastDoc: any }> {
    let q = query(collection(db, ACADEMIC_COLLECTION), limit(limitCount));
    if (lastDocSnap) {
      q = query(q, startAfter(lastDocSnap));
    }
    const querySnapshot = await getDocs(q);
    const data: Article[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Article);
    });
    return { data, lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null };
  },`;

    content = content.replace('async getArticleById(', articlesPaginated + '\n\n  async getArticleById(');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

addPagination('src/services/communityService.ts');
addPagination('src/services/articleService.ts');
console.log('Services updated');
