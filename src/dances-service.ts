import { initializeApp } from "firebase/app";
import {
  getFirestore,
  Timestamp,
  collection,
  setDoc,
  doc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  increment,
  onSnapshot,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const COLLECTION = "dances";
const firebaseConfig = {
  apiKey: "AIzaSyB11R66JYGt-Zp3fmNZDxkfFazLtLQbFxI",
  authDomain: "junction-move.firebaseapp.com",
  projectId: "junction-move",
  storageBucket: "junction-move.appspot.com",
  messagingSenderId: "1014139268429",
  appId: "1:1014139268429:web:2ba259e169b63cf1f45b04",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export type DancePost = {
  id: string;
  createdAt: Timestamp;
  userId: string;
  levelId: string;
  videoPublicUrl: string;
  fitnessStats: {
    score: number;
    velocity: number;
    acceleration: number;
  };
  likes?: number;
};

export type DancePostDto = Omit<
  DancePost,
  "videoPublicUrl" | "id" | "createdAt"
>;

export async function uploadDancePost(post: DancePostDto, videoBlob: any) {
  const collectionRef = collection(db, COLLECTION);
  const docRef = doc(collectionRef);

  // Create a root reference
  const storage = getStorage();

  console.log("Uploading video...");

  const videoRef = ref(storage, `dances/${docRef.id}.mp4`);
  await uploadBytes(videoRef, videoBlob);
  console.log("Uploaded video...");

  const publicUrl = await getDownloadURL(videoRef);

  const result = await setDoc(docRef, {
    id: docRef.id,
    videoPublicUrl: publicUrl,
    createdAt: Timestamp.now(),
    likes: 1,
    ...post,
  });
}

export function getPosts(setPosts: (posts: DancePost[]) => void) {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    setPosts(querySnapshot.docs.map((doc) => doc.data() as DancePost));
  });

  return unsubscribe;
}

export function likePost(id: string) {
  const collectionRef = collection(db, COLLECTION);
  const docRef = doc(collectionRef, id);
  updateDoc(docRef, {
    likes: increment(1),
  });
}
