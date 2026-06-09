\*\*HƯỚNG DẪN HỌC TẬP HỌC PHẦN CÔNG NGHỆ PHẦN MỀM K4\*\*



\*\*Quy định và cách thức triển khai học tập\*\*



Tổ chức học tập theo phương pháp lớp học đảo ngược



Trước buổi học:



Sinh viên đọc slide bài giảng để nắm được nội dung buổi học



Làm bài tập trên hệ thống edux và các nhiệm vụ khác được giao



Trong buổi học:



Tham gia hoạt động, tương tác để rà soát lại các nội dung chính



Thực hiện các nhiệm vụ và hoạt động nhóm để làm rõ nội dung cốt lõi của bài học



Sau buổi học:



Hoàn thiện bài tập theo góp ý của GV



Đọc slide, tài liệu chuẩn bị cho buổi học tiếp theo



Chuẩn bị cho bài tập nhóm



\*\*Quy định chia nhóm\*\*



5-6 sinh viên/1nhóm/1 đề tài



Các nhóm chọn đăng ký các đề tài khác nhau



\*\*Giao nhiệm vụ nhóm\*\*



Nhóm được giao nhiệm vụ và thực hiện nhiệm vụ theo từng tuần



Nhiệm vụ cá nhân được giao theo từng buổi



\*\*🏃 LỘ TRÌNH 10 TUẦN PHÁT TRIỂN PHẦN MỀM MVP VỚI AI AGENT\*\*



\### Tuần 1 — Agent onboarding và chọn hướng project



\#### Mục tiêu



Sinh viên biết Codex/AI agent có thể làm nhiều việc trong vòng đời phần mềm, không chỉ viết code.



\#### Hoạt động



\- Cài Codex CLI, Codex IDE extension, Cursor hoặc công cụ tương đương.

\- Tạo GitHub repository.

\- Chọn hướng:Làm app mới.

\- Làm lại app đã có.

\- Nâng cấp project có sẵn.



\- Viết AGENT\_GUIDE.md.

\- Viết AI\_USAGE\_POLICY.md.



\#### Bài nộp



PRODUCT\_DIRECTION.md

AGENT\_GUIDE.md

AI\_USAGE\_POLICY.md

ai-logs/week-01.md



\### Tuần 2 — Phân tích phần mềm gốc hoặc ý tưởng sản phẩm



\#### Mục tiêu



Sinh viên phân tích sản phẩm thay vì nhảy vào code.



\#### Hoạt động



Nếu làm lại phần mềm đã có:



\- Mô tả phần mềm gốc.

\- Xác định điểm yếu hoặc điểm phức tạp.

\- Chọn phiên bản MVP đơn giản hơn.

\- Đề xuất tính năng AI.



Nếu làm app mới:



\- Phân tích người dùng.

\- Xác định vấn đề.

\- Chọn MVP.

\- Đề xuất tính năng AI.



\#### Bài nộp



PRODUCT\_ANALYSIS.md

AI\_FEATURE\_PROPOSAL.md

ai-logs/week-02.md



\### Tuần 3 — Codebase reading hoặc prototype



\#### Mục tiêu



Sinh viên dùng Codex để hiểu project có sẵn hoặc tạo prototype.



\#### Hoạt động



Nhóm dùng project có sẵn:



\- Codex đọc repo.

\- Codex tạo CODEBASE\_OVERVIEW.md.

\- Sinh viên kiểm tra lại.



Nhóm làm app mới:



\- Codex/v0/Cursor tạo UI prototype.

\- Dùng mock data.

\- Không làm backend quá sớm.



\#### Bài nộp



CODEBASE\_OVERVIEW.md hoặc UX\_PROTOTYPE.md

Updated REQUIREMENTS.md

ai-logs/week-03.md



\### Tuần 4 — Requirements, issues và agent-ready tasks



\#### Mục tiêu



Sinh viên học cách tạo issue đủ rõ để giao cho agent.



\#### Hoạt động



\- Viết 8–12 user stories.

\- Chọn 1–2 AI user stories.

\- Chuyển user stories thành GitHub Issues.

\- Mỗi issue có acceptance criteria.



\#### Bài nộp



REQUIREMENTS.md

GitHub Issues

PROMPTS.md

ai-logs/week-04.md



\### Tuần 5 — Architecture và AI feature design



\#### Mục tiêu



Thiết kế hệ thống và vị trí của tính năng AI.



\#### Hoạt động



\- Thiết kế kiến trúc.

\- Thiết kế database.

\- Thiết kế AI feature flow.

\- Xác định dữ liệu gửi vào AI.

\- Xác định rủi ro privacy và hallucination.



\#### Mẫu AI feature design



\# AI Feature Design



\## Feature name

AI feedback summarizer



\## User value

Helps instructors quickly understand common student feedback.



\## Input

A list of anonymous feedback comments.



\## Output

\- Summary

\- Top recurring issues

\- Suggested actions



\## Human control

The instructor can edit or discard the AI output.



\## Risks

\- Hallucinated summary

\- Sensitive information in comments

\- Over-trust in AI output



\## Mitigation

\- Show original comments

\- Mark output as AI-generated

\- Do not use student names



\#### Bài nộp



docs/architecture.md

docs/data-model.md

AI\_FEATURE\_DESIGN.md

ai-logs/week-05.md



\### Tuần 6 — Implementation sprint: core feature



\#### Mục tiêu



Codex triển khai chức năng chính, sinh viên kiểm tra và review.



\#### Hoạt động



\- Chọn một issue không-AI trước.

\- Codex lập plan.

\- Codex implement.

\- Sinh viên chạy app.

\- Sinh viên review diff.

\- Tạo PR.



\#### Bài nộp



One core feature PR

Review notes

Test result

ai-logs/week-06.md



\### Tuần 7 — Implementation sprint: AI feature



\#### Mục tiêu



Thêm một tính năng AI nhỏ, có kiểm soát.



\#### Hoạt động



\- Tạo AI feature issue.

\- Thiết kế prompt hoặc API call.

\- Tạo UI cho AI output.

\- Thêm trạng thái loading/error.

\- Cho người dùng chỉnh sửa hoặc bỏ qua kết quả AI.

\- Không tự động tin hoàn toàn vào output AI.



\#### Prompt cho Codex



Implement the AI feature described in AI\_FEATURE\_DESIGN.md.



Requirements:

\- Keep the feature small

\- Add a clear user action button, such as "Generate summary"

\- Show loading and error states

\- Mark the result as AI-generated

\- Allow the user to edit or discard the AI result

\- Do not send unnecessary personal data to the AI service

\- Add basic tests or a manual test checklist



\#### Bài nộp



AI feature PR

AI\_FEATURE\_TEST.md

Privacy notes

ai-logs/week-07.md



\### Tuần 8 — Testing, security và hallucination checks



\#### Mục tiêu



Sinh viên kiểm tra cả phần mềm lẫn tính năng AI.



\#### Hoạt động



\- Codex viết test.

\- Codex review bảo mật.

\- Kiểm tra secret.

\- Kiểm tra authorization.

\- Kiểm tra AI output có thể sai hay không.

\- Viết cảnh báo cho người dùng.



\#### Prompt



Review the AI feature for safety and reliability.



Check:

\- What data is sent to the AI model?

\- Is any personal or sensitive data sent unnecessarily?

\- Can the AI output be wrong or misleading?

\- Does the UI tell users that the result is AI-generated?

\- Can the user edit or reject the AI output?

\- Are there tests or manual checks?



\#### Bài nộp



TEST\_PLAN.md

SECURITY.md

AI\_SAFETY\_REVIEW.md

ai-logs/week-08.md



\### Tuần 9 — Codex for refactoring, documentation and CI/CD



\#### Mục tiêu



Dùng Codex để hoàn thiện sản phẩm, không chỉ thêm tính năng.



\#### Hoạt động



\- Codex tìm technical debt.

\- Codex đề xuất refactor nhỏ.

\- Codex cập nhật README.

\- Codex sửa CI/CD.

\- Codex viết deployment guide.

\- Sinh viên kiểm tra lại toàn bộ.



\#### Bài nộp



TECHNICAL\_DEBT.md

Refactoring PR

DEPLOYMENT.md

Passing CI

ai-logs/week-09.md



\### Tuần 10 — Release, demo và defense



\#### Mục tiêu



Sinh viên chứng minh mình hiểu sản phẩm và hiểu cách AI agent đã được sử dụng.



\#### Bài nộp



Release v1.0.0

FINAL\_REPORT.md

AI\_ENGINEERING\_REFLECTION.md

Demo link

ai-logs/week-10.md



\#### Câu hỏi bảo vệ bắt buộc



\- Sản phẩm của nhóm làm lại từ phần mềm nào hoặc giải quyết vấn đề gì?

\- Vì sao nhóm chọn MVP này?

\- Tính năng AI là gì?

\- Codex đã giúp những việc nào ngoài viết code?

\- Một prompt tốt nhất của nhóm là gì?

\- Codex đã tạo lỗi gì?

\- Nhóm phát hiện lỗi bằng cách nào?

\- Nhóm có đọc diff không?

\- Test nào chứng minh chức năng chạy đúng?

\- Dữ liệu nào được gửi vào AI model?

\- Người dùng có thể kiểm soát output AI không?

\- Nếu bỏ AI feature, sản phẩm còn giá trị không?



\# Hướng dẫn thực hành



\## Agent-First Software Product Engineering với Codex và AI Agents



\## 1. Tư tưởng môn học



Trong bối cảnh mới, sinh viên không chỉ dùng AI để “viết code nhanh hơn”. Sinh viên cần học cách \*\*điều phối AI agent như một thành viên trong nhóm phát triển phần mềm\*\*.



Codex, Claude Code, Cursor Agent, GitHub Copilot Agent hoặc các agent tương tự có thể hỗ trợ:



\- Đọc và hiểu codebase.

\- Tóm tắt kiến trúc hệ thống.

\- Phân tích yêu cầu.

\- Chia nhỏ công việc thành issue.

\- Đề xuất kế hoạch triển khai.

\- Viết hoặc sửa code.

\- Chạy lệnh, chạy test, đọc lỗi.

\- Debug.

\- Review pull request.

\- Sửa lỗi CI/CD.

\- Viết tài liệu.

\- Refactor.

\- Thêm tính năng AI.

\- Nâng cấp phần mềm có sẵn.

\- Chuẩn bị báo cáo và phần bảo vệ.



Thông điệp chính cho sinh viên:



\*\*AI agent có thể làm rất nhiều việc, nhưng sinh viên phải biết giao việc, kiểm tra, đánh giá và chịu trách nhiệm.\*\*



\## 2. Định hướng bài tập



Không nhất thiết mọi nhóm phải làm phần mềm mới từ con số 0. Sinh viên có thể chọn một trong ba hướng.



\### Hướng 1 — Làm sản phẩm mới



Ví dụ:



\- Gia sư AI.

\- Mini LMS.

\- Feedback system.

\- Peer review system.



Hướng này phù hợp với nhóm muốn xây dựng từ đầu.



\### Hướng 2 — Làm lại phần mềm đã có theo hướng tốt hơn



Sinh viên chọn một phần mềm quen thuộc, rồi làm phiên bản đơn giản hơn nhưng có cải tiến. Chọn các sản phẩm đang nổi trên Play Store, Apps Store.



Phần mềm gốc



Phiên bản sinh viên có thể làm



Trello



Simple Kanban for student projects



Google Forms



Smart feedback form with AI summary



Notion



Lightweight course note manager



Moodle



Mini LMS with AI teaching assistant



GitHub Issues



Simple project tracker with AI issue refinement



Calendly



Classroom appointment booking



Quizizz/Kahoot



Simple quiz system with AI question generator



Stack Overflow



Course Q\&A system with AI answer assistant



Grammarly



Simple writing assistant for student reports



Mục tiêu không phải copy toàn bộ, mà là:



Understand existing software -> Identify pain points -> Build a focused MVP -> Add one meaningful AI feature



\### Hướng 3 — Nâng cấp một phần mềm mã nguồn mở hoặc project cũ



Sinh viên có thể lấy:



\- Project cá nhân cũ.

\- Starter template.

\- Open-source app nhỏ.



Sau đó dùng Codex để:



\- Hiểu codebase.

\- Sửa bug.

\- Thêm test.

\- Cải thiện UI.

\- Refactor.

\- Thêm tính năng AI.

\- Deploy lại.



Hướng này rất phù hợp với sinh viên trung bình vì các em không phải bắt đầu từ trang trắng.



\## 2A. Chính sách chọn công cụ cho sinh viên



Vì các công cụ AI có quota, chính sách giá, khả năng truy cập và mức độ ổn định khác nhau, mỗi nhóm không nên phụ thuộc vào một công cụ duy nhất.



\### Yêu cầu bắt buộc



Mỗi nhóm phải chọn:



\- \*\*Một cloud agent chính\*\*, ví dụ:Codex

\- Gemini CLI

\- GitHub Copilot Agent

\- Cursor Agent

\- Claude Code



\- \*\*Một agent dự phòng mã nguồn mở hoặc chi phí thấp\*\*, ví dụ:Cline

\- Roo Code

\- Aider

\- Continue



\- \*\*Một phương án dự phòng khi hết quota\*\*, ví dụ:Gemini CLI với quota miễn phí

\- Ollama với local model

\- LM Studio với local model

\- Chia nhỏ task và tiếp tục thủ công



\- \*\*Một SDK để xây dựng tính năng AI trong sản phẩm\*\*, khuyến nghị:Vercel AI SDK cho project Next.js

\- Provider SDK chỉ dùng khi thật sự cần



\### Cấu hình khuyến nghị cho sinh viên trung bình



Với đa số nhóm, cấu hình nên dùng là:



GitHub + VS Code

Codex hoặc Gemini CLI

Cline hoặc Roo Code làm backup

Next.js + Supabase + Vercel

Vercel AI SDK cho tính năng AI

Playwright cho end-to-end testing



\### Tiêu chí chọn công cụ



Một công cụ phù hợp với học phần nếu thỏa ít nhất hai tiêu chí sau:



\- Có free tier hoặc quota đủ lớn cho sinh viên.

\- Mã nguồn mở.

\- Làm việc tốt với Git và pull request.

\- Có thể đọc và chỉnh sửa codebase.

\- Có thể chạy terminal hoặc test.

\- Cho phép sinh viên duyệt hành động trước khi thay đổi.

\- Cài đặt không quá phức tạp.

\- Có tài liệu tốt và cộng đồng sử dụng rộng.



\## 2B. Nhóm công cụ nên bổ sung vào học phần



\### Công cụ nên dùng mặc định hoặc rất nên khuyến khích



\*\*Công cụ\*\*



\*\*Vai trò\*\*



\*\*Lý do phù hợp với sinh viên\*\*



Codex CLI / Codex IDE



Agent chính cho đọc repo, lập kế hoạch, sửa code, chạy test, review



Phù hợp trọng tâm môn học; hỗ trợ nhiều bước trong vòng đời phát triển phần mềm



Gemini CLI



Agent terminal có quota miễn phí lớn



Phù hợp lớp đông sinh viên, đặc biệt khi thiếu ngân sách



GitHub Copilot Student / Copilot Agent



IDE assistant và issue-to-PR workflow



Tốt nếu sinh viên xác thực được GitHub Education



Cline



Open-source coding agent trong VS Code



Sinh viên có thể thấy và phê duyệt từng hành động



Roo Code



Open-source agent trong VS Code



Hỗ trợ nhiều mode như Code, Architect, Ask, Debug



Aider



Terminal pair programming gắn với Git



Rất tốt để dạy diff, commit, revert và kiểm soát thay đổi



Continue



Open-source AI code assistant



Phù hợp dạy AI review, custom rules và workflow trong repo



Vercel AI SDK



SDK xây dựng AI feature



Rất hợp với Next.js, streaming response và nhiều model provider



Supabase



Backend, Auth, Database



Free tier phù hợp MVP sinh viên



Vercel



Deployment



Triển khai Next.js nhanh, dễ demo



Playwright



End-to-end testing



Kiểm thử luồng người dùng rõ ràng



\### Công cụ nên để optional



Công cụ



Khi nào nên dùng



Claude Code



Nhóm có quota hoặc budget tốt, cần agent terminal mạnh



Cursor



Nhóm muốn vibe coding nhanh, nhưng cần chú ý giới hạn request



OpenHands



Nhóm khá, muốn thử software agent mã nguồn mở nâng cao



Ollama



Khi muốn chạy local model hoặc hết quota cloud



LM Studio



Khi muốn giao diện local LLM dễ dùng hơn



Bolt / Lovable / v0



Khi cần dựng prototype UI nhanh



PostHog / Sentry



Khi nhóm muốn thêm analytics hoặc error tracking



\## 2C. Quy tắc an toàn về quota và chi phí



Sinh viên không được giả định rằng AI usage là vô hạn.



Mỗi nhóm phải:



\- Ghi lại công cụ AI đã dùng.

\- Tránh gửi toàn bộ repository nhiều lần nếu không cần.

\- Ưu tiên task nhỏ thay vì một prompt quá lớn.

\- Dùng công cụ local hoặc mã nguồn mở khi hết quota cloud.

\- Không đưa paid API key trực tiếp vào repository.

\- Dùng .env.example thay vì commit .env.

\- Dừng lại và hỏi giảng viên nếu công cụ yêu cầu thanh toán bất thường.

\- Lưu lại prompt, kết quả quan trọng, hoặc ảnh chụp màn hình khi cần làm minh chứng.



Thứ tự fallback khuyến nghị khi hết quota:



1\. Dùng Gemini CLI nếu còn quota miễn phí

2\. Dùng Cline/Roo Code với model khác

3\. Dùng Aider cho các chỉnh sửa nhỏ trong terminal

4\. Dùng Ollama hoặc LM Studio cho giải thích code, tài liệu, refactor đơn giản

5\. Chia nhỏ task và làm thủ công



\## 2D. Local AI option



Sinh viên có thể dùng local AI như Ollama hoặc LM Studio khi:



\- quota cloud đã hết;

\- project có dữ liệu riêng tư hoặc nhạy cảm;

\- task chủ yếu là giải thích, tóm tắt, viết tài liệu hoặc refactor đơn giản;

\- nhóm muốn thử nghiệm open models.



Tuy nhiên, local model nhỏ có thể yếu hơn cloud model mạnh trong các task phức tạp, đặc biệt là sửa nhiều file hoặc debug sâu. Sinh viên vẫn phải review kết quả, chạy test và giải thích code cuối cùng.



\## 2E. Công cụ tích hợp AI feature vào sản phẩm



Với project Next.js, khuyến nghị dùng \*\*Vercel AI SDK\*\* để xây dựng tính năng AI vì:



\- hỗ trợ streaming response;

\- hỗ trợ nhiều model provider;

\- tích hợp tốt với React và Next.js;

\- dễ đặt logic AI ở server-side route;

\- dễ thay đổi provider nếu quota hoặc chi phí thay đổi.



Ví dụ use case phù hợp:



User clicks "Generate summary"

\-> App sends selected feedback text to server route

\-> Server route calls model through Vercel AI SDK

\-> UI streams or displays the generated summary

\-> User edits, accepts, or discards the AI output



Nguyên tắc bắt buộc:



\- Không gửi dữ liệu cá nhân nếu không cần.

\- Không giấu việc output là AI-generated.

\- Cho người dùng kiểm tra, chỉnh sửa hoặc từ chối output.

\- Không để AI tự động thực hiện hành động quan trọng mà không có xác nhận.

\- Có fallback nếu AI call thất bại.



\## 3. Tính năng AI khuyến khích thêm vào sản phẩm



Mỗi nhóm nên thêm ít nhất \*\*một tính năng AI nhỏ nhưng có giá trị\*\*.



Loại sản phẩm



Tính năng AI phù hợp



Task manager



AI chia nhỏ task, đề xuất deadline



LMS



AI tạo quiz từ bài học



Feedback system



AI tóm tắt phản hồi của sinh viên



Note app



AI tóm tắt ghi chú, tạo flashcards



Booking app



AI gợi ý khung giờ phù hợp



Q\&A forum



AI gợi ý câu trả lời nháp



Code review tool



AI phát hiện lỗi phổ biến



Project tracker



AI viết lại issue cho rõ hơn



Survey app



AI phân tích câu trả lời mở



Reading app



AI tạo câu hỏi đọc hiểu



\### Nguyên tắc chọn tính năng AI



Tính năng AI phải:



\- Nhỏ.

\- Dễ demo.

\- Có dữ liệu đầu vào rõ ràng.

\- Có đầu ra kiểm tra được.

\- Không thay thế toàn bộ sản phẩm.

\- Không yêu cầu dữ liệu nhạy cảm.

\- Không quá phụ thuộc vào prompt mơ hồ.



Ví dụ tốt:



Given a long course feedback text, generate:

\- 5 bullet-point summary

\- top 3 recurring problems

\- suggested actions for the instructor



Ví dụ không tốt:



Make the whole system intelligent.



\## 4. Mô hình vai trò của Codex trong môn học



Thay vì coi Codex là “máy viết code”, hãy chia vai trò Codex thành nhiều vai trong vòng đời phát triển phần mềm.



\### 4.1 Codex as Codebase Reader



Dùng khi sinh viên nhận một project có sẵn.



Prompt mẫu:



Read this repository and explain it to a beginner software engineering student.



Please include:

1\. What the application does

2\. Main folders and files

3\. Main user flows

4\. Data model

5\. External services used

6\. How to run the project locally

7\. The 5 most important files to understand first



Do not modify code.



Sản phẩm nộp:



CODEBASE\_OVERVIEW.md



\### 4.2 Codex as Product Analyst



Dùng để phân tích phần mềm đã có và đề xuất cải tiến.



Prompt mẫu:



We want to build a better student-friendly version of \[existing software/product].



Analyze the product idea and propose:

1\. Target users

2\. Pain points in the existing product

3\. A simpler MVP scope

4\. 5 core features

5\. 3 possible AI features

6\. Features that should be out of scope

7\. Risks for a student team



Sản phẩm nộp:



PRODUCT\_ANALYSIS.md



\### 4.3 Codex as Requirements Engineer



Prompt mẫu:



Based on PRODUCT\_ANALYSIS.md, create an MVP backlog.



Each user story must include:

\- ID

\- User role

\- Goal

\- Benefit

\- Acceptance criteria in Given-When-Then format

\- Priority

\- Difficulty

\- Whether AI is involved



Keep stories small enough for beginner students.



Sản phẩm nộp:



REQUIREMENTS.md

GitHub Issues



\### 4.4 Codex as Architect



Prompt mẫu:



You are a software architect helping beginner students.



Design a simple architecture for this MVP.



Requirements:

\- Use Next.js, TypeScript, Supabase, and Vercel

\- Include a Mermaid component diagram

\- Include a data model

\- Include where the AI feature fits

\- Avoid microservices

\- Avoid unnecessary abstractions

\- Identify security risks



Sản phẩm nộp:



docs/architecture.md

docs/data-model.md

docs/adr/ADR-001.md



\### 4.5 Codex as Implementation Agent



Prompt mẫu:



Read AGENT\_GUIDE.md and issue US-03.



First, create a plan.

Do not write code yet.



The plan must include:

1\. Files to modify

2\. Implementation steps

3\. Tests to add

4\. Risks

5\. How to verify manually



Sau khi duyệt kế hoạch:



Implement the approved plan.



Constraints:

\- Keep the solution simple

\- Do not modify unrelated files

\- Do not add dependencies unless necessary

\- Do not change database schema without explaining why

\- After implementation, list all changed files and how to test them



\### 4.6 Codex as Test Engineer



Prompt mẫu:



Act as a test engineer.



Based on user story US-03 and the current implementation, create tests for:

1\. Happy path

2\. Empty input

3\. Unauthorized access

4\. One important edge case



Prefer Playwright for user flows.

Keep tests simple and readable.



Sản phẩm nộp:



TEST\_PLAN.md

e2e tests

test result screenshot or CI log



\### 4.7 Codex as Code Reviewer



Prompt hoặc comment mẫu:



@codex review this pull request. Focus on:

\- logic bugs

\- missing tests

\- unclear code

\- security issues

\- unnecessary changes

\- documentation gaps



Sau đó:



@codex fix the P1 issue and keep the change minimal.



Sản phẩm nộp:



PR review comments

AI review summary

Human review decision



\### 4.8 Codex as DevOps Assistant



Dùng để sửa CI, deployment, environment variables, build errors.



Prompt mẫu:



The GitHub Actions workflow failed.



Here is the error log:

\[paste log]



Please:

1\. Explain the failure

2\. Identify the likely file or config causing it

3\. Suggest the smallest fix

4\. Avoid changing application behavior

5\. Tell us how to verify the fix



Sản phẩm nộp:



CI\_FIX\_REPORT.md

Passing GitHub Actions workflow



\*\*🎓 QUY ĐỊNH CHI TIẾT VỀ BUỔI BÁO CÁO NGHIỆM THU ĐỒ ÁN (TUẦN 10)\*\*



\*\*⏱️ 1. CẤU TRÚC THỜI GIAN (TIME BOX) CHO MỖI NHÓM\*\*



Mỗi nhóm có tối đa \*\*25 phút\*\* làm việc trực tiếp với Hội đồng Giảng viên:



\- \*\*Phần 1: Thuyết trình \& Báo cáo kỹ thuật (7 phút):\*\* Đại diện nhóm tổng hợp quy trình làm việc.

\- \*\*Phần 2: Trình diễn sản phẩm trực tiếp (Live Demo) (8 phút):\*\* Demo các kịch bản người dùng (Scenarios) trực tiếp trên môi trường Cloud (không demo ở localhost).

\- \*\*Phần 3: Vấn đáp độc lập \& Kiểm tra mã nguồn (10 phút):\*\* Giảng viên hỏi từng thành viên để xác định mức độ đóng góp và mức độ làm chủ mã nguồn.



\*\*📊 2. NỘI DUNG BÁO CÁO CHI TIẾT (SLIDE \& REPORT)\*\*



Sinh viên cần chuẩn bị một Slide báo cáo (tối đa 12 - 15 slides) tập trung vào các nội dung cốt lõi sau:



\*\*2.1 Quản trị sản phẩm \& Luồng Agile (15% nội dung)\*\*



\- \*\*Tầm nhìn sản phẩm (Product Vision)\*\* và mục tiêu của bản MVP \[2].

\- \*\*Minh chứng vận hành Agile:\*\* Chụp ảnh màn hình (Screenshot) bảng \*\*GitHub Projects (Kanban)\*\* qua các tuần. Thống kê số lượng Issues, Pull Requests đã đóng.

\- \*\*Chân dung \& Kịch bản lỗi:\*\* Trình bày 1 User Story cốt lõi kèm theo kịch bản nghiệm thu BDD (Given-When-Then) \[2].



\*\*2.2 Kiến trúc hệ thống \& Thiết kế kỹ thuật (35% nội dung)\*\*



\- \*\*Sơ đồ kiến trúc vi dịch vụ (Microservices Architecture Diagram):\*\* Giải thích rõ lý do phân rã hệ thống thành các dịch vụ đó, cơ chế giao tiếp giữa chúng (REST API/Message Broker) \[2].

\- \*\*Sơ đồ thực thể dữ liệu (ERD):\*\* Giải thích việc lựa chọn SQL hay NoSQL cho từng dịch vụ \[2].

\- \*\*An toàn \& Bảo mật:\*\* Giải thích cách triển khai mã hóa mật khẩu, phân quyền bằng JWT và giải pháp bảo vệ quyền riêng tư dữ liệu người dùng \[2].



\*\*2.3 Chu trình DevOps \& Tự động hóa (25% nội dung)\*\*



\- \*\*Kiến trúc CI/CD Pipeline:\*\* Sơ đồ luồng tự động hóa bằng GitHub Actions.

\- \*\*Báo cáo kiểm thử tự động:\*\* Chỉ số độ bao phủ mã nguồn (\*\*Code Coverage\*\*) đạt bao nhiêu %? (Có ảnh chụp màn hình terminal chạy Jest/Mocha).

\- \*\*Hạ tầng Cloud:\*\* Địa chỉ URL của ứng dụng đã được deploy trực tuyến (Render, Railway, v.v.) \[2].



\*\*2.4 Báo cáo khai thác và tương tác với AI Agent (15% nội dung)\*\*



\- Nhóm đã dùng AI Agent nào? (\*\*Google Antigravity\*\*, \*\*Cursor\*\*, \*\*Claude Code\*\*, v.v.).

\- \*\*Nhật ký Prompt:\*\* Trích dẫn 2 Prompt hiệu quả nhất giúp nhóm giải quyết lỗi phức tạp hoặc sinh cấu trúc dự án tự động.

\- \*\*Bài học kinh nghiệm:\*\* AI đã giúp tăng năng suất bao nhiêu % và những giới hạn/bẫy kỹ thuật (Hallucination) mà nhóm đã gặp phải và tự vượt qua.



\*\*🎯 3. TIÊU CHÍ ĐÁNH GIÁ ĐỒ ÁN (ASSESSMENT RUBRIC)\*\*



Điểm số của sinh viên sẽ bao gồm \*\*Điểm chung của Nhóm (Sản phẩm)\*\* và \*\*Điểm độc lập của cá nhân (Vấn đáp)\*\* để tránh tình trạng "gánh team" ở các trường đại học tư nhân.



\*\*📊 BẢNG TIÊU CHÍ CHẤM ĐIỂM (THANG ĐIỂM 10)\*\*



\*\*Tiêu chí thành phần\*\*



\*\*Trọng số\*\*



\*\*Mức Xuất sắc (9.0 - 10)\*\*



\*\*Mức Khá - Trung bình (5.0 - 8.0)\*\*



\*\*Mức Yếu (Kháng nghị - <5.0)\*\*



\*\*1. Tính hoàn thiện của MVP \& Live Demo\*\*



\*\*30%\*\*



Sản phẩm chạy thực tế trên Cloud không lỗi. Giao diện mượt mà. Đáp ứng 100% các kịch bản nghiệm thu BDD đã cam kết ở tuần 3 \[2].



Sản phẩm chỉ chạy được ở Local hoặc deploy lên Cloud nhưng một số tính năng bị lỗi (Mã lỗi 500/404). Giao diện bị vỡ \[2].



Ứng dụng không chạy được, crash ngay khi demo hoặc không có link deploy trực tuyến \[2].



\*\*2. Kiến trúc \& Thiết kế Bảo mật\*\*



\*\*20%\*\*



Phân rã Microservices chuẩn chỉnh, chạy mượt bằng Docker-Compose. Có bọc lỗi phòng thủ (try-catch), xác thực JWT và mã hóa dữ liệu nhạy cảm thành công \[2].



Hệ thống mang tiếng Microservices nhưng thực chất là Monolithic (chung một database, code dính chặt vào nhau). Thiếu bọc lỗi phòng thủ \[2].



Code chép hoàn toàn trên mạng, không cấu hình Docker, lưu mật khẩu người dùng dưới dạng text thuần túy \[2].



\*\*3. Chu trình DevOps \& Chất lượng Test\*\*



\*\*20%\*\*



File cấu hình GitHub Actions hoạt động hoàn hảo (Đèn xanh). Tỷ lệ Code Coverage > 70%. Có chạy quét lỗ hổng bảo mật tự động (SAST) \[2].



Có viết file YAML cho pipeline nhưng chạy bị lỗi (Đèn đỏ) hoặc tắt bớt các bước test để đối phó. Tỷ lệ test coverage < 30% \[2].



Không có cấu hình CI/CD. Không có bất kỳ một file test tự động nào trong mã nguồn \[2].



\*\*4. Quy trình Agile \& Nhật ký AI\*\*



\*\*10%\*\*



Minh chứng rõ ràng lịch sử commit đồng đều của các thành viên. Nộp đủ tệp nhật ký chat chứng minh tư duy làm chủ và ra lệnh cho AI \[2].



Bảng GitHub Projects tạo ra nhưng chỉ cập nhật vào tuần cuối cùng. Nhật ký Prompt sơ sài, thiếu minh chứng tương tác với AI Agent \[2].



Không sử dụng GitHub để quản lý dự án (nộp file nén qua Zalo). Không chứng minh được việc ứng dụng AI.



\*\*5. Vấn đáp cá nhân (Điểm độc lập)\*\*



\*\*20%\*\*



Giải thích vanh vách bản chất cấu trúc dòng code do AI sinh ra. Trả lời xuất sắc câu hỏi phản biện về kiến trúc hệ thống và mở rộng quy mô.



Hiểu lờ mờ về đoạn code AI viết, giải thích sai một số khái niệm cơ bản về bất đồng bộ, Routing hoặc State.



Hoàn toàn không biết dòng code đó hoạt động thế nào, ú ớ khi giảng viên yêu cầu giải thích cơ chế xử lý lỗi trong mã nguồn.



\*\*💡 4. BỘ CÂU HỎI VẤN ĐÁP MẪU DÀNH CHO GIẢNG VIÊN (ORAL DEFENSE QUESTIONS)\*\*



Để chấm điểm cấu phần \*\*Vấn đáp cá nhân (20%)\*\*, thầy/cô có thể sử dụng các câu hỏi "bẫy" sau để kiểm tra xem sinh viên có thực sự làm chủ mã nguồn do AI viết hay không:



\- \*\*Hỏi Developer:\*\* \*"Tôi thấy đoạn code này AI sử dụng hàm setInterval để cập nhật vị trí xe chạy sau mỗi 3 giây. Em hãy giải thích cơ chế xóa bộ nhớ (Clear Interval) khi component này bị tắt (Unmount) để tránh hiện tượng tràn bộ nhớ (Memory Leak) là gì?"\*

\- \*\*Hỏi DevOps Engineer:\*\* \*"Trong file cấu hình GitHub Actions của nhóm, nếu tôi cố tình sửa code làm cho một bài Unit Test bị fail, hệ thống pipeline của em có tự động chặn không cho phép merge Pull Request đó vào nhánh main không? Cơ chế đó được cấu hình ở dòng nào?"\*

\- \*\*Hỏi Product Owner / BA:\*\* \*"Nếu bây giờ khách hàng yêu cầu tích hợp thêm tính năng quét mã QR của học sinh khi lên xe, em sẽ thêm User Story này vào đâu trong Product Backlog và độ ưu tiên của nó sẽ thay đổi thế nào so với các tính năng hiện tại?"\* \[2]

