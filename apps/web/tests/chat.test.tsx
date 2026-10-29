import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TourMessageCard } from "@/components/chat/TourMessageCard";
import { ChatWorkspace } from "@/components/admin/chats/ChatWorkspace";

test("tour card shows departure price, date and selected schedule link", () => {
 const html = renderToStaticMarkup(<TourMessageCard context={{kind:"tour", id:42, title:"Đà Nẵng - Hội An", url:"/tours/42", image_url:"https://example.com/tour.jpg", price:5535000, duration:"3 ngày 2 đêm", schedule_id:12, departure_date:"2026-10-25T00:00:00.000Z"}}/>);
 assert.match(html, /Khởi hành:/);
 assert.match(html, /25\/10\/2026/);
 assert.match(html, /5\.535\.000/);
 assert.match(html, /scheduleId=12/);
 assert.match(html, /Xem chi tiết/);
});
test("legacy tour messages without departure data still render", () => {
 const html = renderToStaticMarkup(<TourMessageCard context={{kind:"tour", id:42, title:"Tour cũ", url:"/tours/42"}}/>);
 assert.match(html, /Tour cũ/);
 assert.doesNotMatch(html, /Invalid Date|undefined|NaN/);
});
import { TourRecommendationCard } from "@/components/common/TourRecommendationCard";

test("shared recommendation card accepts tour data without a chat session", () => {
 const html = renderToStaticMarkup(<TourRecommendationCard tour={{id:7,title:"Tour chatbot",url:"/tours/7",price:1890000}}/>);
 assert.match(html, /Tour chatbot/);
 assert.match(html, /1\.890\.000/);
 assert.match(html, /w-full/);
 assert.match(html, /max-w-\[600px\]/);
 assert.doesNotMatch(html, /aria-pressed/);
});

test("admin conversation uses the customer's avatar in the message timeline", () => {
 const noop = () => {};
 const html = renderToStaticMarkup(<ChatWorkspace
  conversation={{conversation_id:1,user_id:2,status:"IN_PROGRESS",last_message:"Xin chào",last_message_at:"2026-10-29T10:00:00Z",unread_count:0,users:{user_id:2,full_name:"Nguyễn An",avatar_url:"https://example.com/customer-avatar.jpg"}}}
  messages={[{message_id:1,conversation_id:1,sender_id:2,sender_role:"USER",message_type:"TEXT",content:"Xin chào",created_at:"2026-10-29T10:00:00Z",is_read:true}]}
  loading={false} hasMore={false} connected typing={false} busy={false}
  onBack={noop} onSend={async () => {}} onTyping={noop} onLoadMore={noop} onRetry={noop} onVisible={noop}
 />);
 const timeline = html.split('aria-label="Lịch sử tin nhắn"')[1]?.split('role="status"')[0];
 assert.ok(timeline);
 assert.match(timeline, /src="https:\/\/example\.com\/customer-avatar\.jpg"/);
});
