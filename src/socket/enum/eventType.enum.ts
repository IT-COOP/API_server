export enum EventType {
  recruitComment = 1,
  recruitCommentReply = 2,
  recruitApply = 3,
  recruitApplyAccepted = 4,
  informationComment = 5,
  informationCommentReply = 6,
  recruitFulfilled = 7,
  chat = 8,
}
/**
 * 가능한 사건
 *
 * 정보 댓글 달림 < postId를 줍니다.
 * 정보 대댓글 달림 < postId를 줍니다.
 * 협업 신청이 왔음 < postId를 줍니다.
 * 협업 신청 수락됨. < postId를 줍니다.
 * 협업 댓글 달림 < postId를 줍니다.
 * 협업 대댓글 달림 < postId를 줍니다.
 * 채팅이 왔음 < chatRoomId를 줍니다.
 */
