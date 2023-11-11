import { initializeApp } from "firebase/app";
import {
  getFirestore,
  Timestamp,
  collection,
  setDoc,
  doc,
  getDocs,
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
  videoPublicUrl: string;
  fitnessStats: {
    score: number;
  };
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
    ...post,
  });
}

export async function getPosts() {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  const posts: DancePost[] = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    posts.push(doc.data() as DancePost);
  });

  return posts;
}
