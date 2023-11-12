const usernames = [
  "SnappyCarrot9😋",
  "SneezyIguana31🙈",
  "SnappyApple89😱",
  "ZippyFlamingo99🐵",
  "JumpyElephant87😄",
  "CheeryGiraffe47🙈",
  "BreezyHippo28😋",
  "SneezyHippo78😎",
  "ZippyCarrot77😱",
  "BreezyElephant53😎",
  "SneezyElephant74😎",
  "BreezyJaguar25😆",
  "ZippyApple83😋",
  "HappyFlamingo16😉",
  "BreezyJaguar51😉",
  "SnappyJaguar73🙈",
  "ChirpyElephant51😎",
  "ChirpyGiraffe30😄",
  "BouncyApple30😄",
  "SnappyIguana19🐵",
  "ZippyBanana71😉",
  "SillyHippo42😱",
  "CheeryHippo94😄",
  "SneezyBanana19😊",
  "SnappyElephant69😆",
  "JumpyIguana57😊",
  "HappyGiraffe97😉",
  "HappyGiraffe38😆",
  "SillyApple39😉",
  "HappyApple82🐵",
  "HappyBanana43😆",
  "SneezyHippo84😆",
  "SnappyDaisy2🙈",
  "SnappyGiraffe62😆",
  "SneezyFlamingo2😋",
  "SnappyHippo1😱",
  "SillyGiraffe93😋",
  "ChirpyDaisy32😆",
  "BouncyFlamingo32😆",
  "SneezyFlamingo33😄",
  "ZippyCarrot56😱",
  "BouncyDaisy86😄",
  "CheeryCarrot15😆",
  "SillyFlamingo24😆",
  "SnappyFlamingo19😱",
  "SillyBanana71😂",
  "HappyJaguar60😆",
  "ZippyFlamingo10😋",
  "ZippyElephant17😆",
  "BreezyJaguar85😉",
];

export function getRandomUsername() {
  const randomIndex = Math.floor(Math.random() * usernames.length);
  return usernames[randomIndex];
}