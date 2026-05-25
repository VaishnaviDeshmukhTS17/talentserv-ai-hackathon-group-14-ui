```md
Agentic Programming Hackathon - Challenge Brief 

Real Estate Property Intelligence Dashboard using Agentic Programming 

Attribute 

Details 

Difficulty 

Advanced 

Recommended Team Profile 

Frontend/dashboarding, backend/API integration, data ingestion, data engineering, authentication, deployment, and strong agentic programming usage 

Core MVP Pillars 

Third-party authentication, functional implementation, test cases, and deployment/local runnable demo 

Runtime AI 

Optional but recommended for requirement parsing, sentiment summarization, recommendation explanation, or query refinement 

1. Summary 

Build a real estate property intelligence dashboard where a logged-in user can enter a natural-language property requirement. The application should collect or ingest property-related data from permitted sources or sample datasets, normalize and compare listings, enrich the analysis with builder/project reputation, public sentiment, and trend context, and present a comparative dashboard with recommendations. 

2. Problem Statement 

Property buyers often compare listings across multiple platforms and external information sources. Data is scattered across listing portals, builder/project pages, locality discussions, YouTube reviews/comments, price trends, and search-interest signals. Users need a single comparative view that helps them evaluate properties against their requirements. 

3. Objective 

The solution should support the following end-to-end flow: 

User requirement -> requirement parsing -> permitted data ingestion -> cleanup/deduplication -> enrichment -> comparative dashboard -> recommendation summary 

4. MVP Scope 

Area 

MVP Requirement 

Authentication 

Third-party login/logout and protected dashboard route 

Requirement Input 

User can type a natural-language property requirement 

Requirement Parsing 

Extract city, locality, budget, BHK, buy/rent, status preference, and notes 

Data Collection / Ingestion 

Use permitted live sources, mock pages, CSV/JSON, or sample datasets 

Data Cleanup 

Normalize price, area, BHK, status, locality, and source 

Deduplication 

Detect duplicate or similar listings across sources 

Enrichment 

Add builder/project reputation, public sentiment, and trend context 

Dashboard 

Show comparative property insights and recommendations 

Tests 

Include test cases for parsing, cleanup, deduplication, and dashboard logic 

Deployment 

Hosted demo preferred; local runnable demo accepted with lower deployment score 

5. Authentication and Access Scope 

Requirement 

Expectation 

Third-party auth 

Auth0, Firebase Auth, Clerk, Supabase Auth, Azure Entra ID, Google login, or equivalent 

Login/logout 

User can log in and log out 

Protected route 

Main application/dashboard route requires login 

User identity 

Logged-in user name/email is visible or available in the app 

Password handling 

Teams must not build custom password storage or store raw passwords 

6. Data Source and Compliance Rules 

Teams may use MagicBricks, Housing.com, NoBroker, builder websites, YouTube, public trend sources, or other real-estate-related sources only where collection is allowed. Teams must include a fallback dataset so the demo does not depend on live scraping. 

Rule 

Requirement 

Respect restrictions 

Check robots.txt, terms of use, and access permissions for each source 

No bypassing 

Do not bypass login walls, CAPTCHA, rate limits, or anti-bot controls 

No private data 

Do not collect personal phone numbers, private profiles, or sensitive contact data 

Responsible crawling 

Use low-volume, polite collection only where allowed 

Source tracking 

Store source name and URL where available 

Fallback data 

Provide CSV/mock/sample data for reliable demo execution 

Compliance note 

Submission must mention which sources were used and how data was collected 

7. Functional Requirements 

A. Natural-Language Property Requirement Input 

Example inputs: 

Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move. 

Need a rental apartment near Whitefield Bangalore, 2 or 3 BHK, budget under 45k per month. 

Compare new projects in Wakad and Baner for investment under 1.2 crore. 

Extracted Field 

Example 

city 

Pune 

locality 

Hinjewadi 

transaction_type 

Buy 

bhk 

2 

budget_max 

8000000 

property_type 

Apartment 

status_preference 

Ready to Move 

preference_notes 

Near IT parks 

B. Property Data Fields 

Required Field 

Example 

property_id 

PROP001 

title 

2 BHK Apartment in Hinjewadi 

source 

Housing / MagicBricks / NoBroker / Mock 

source_url 

Listing URL 

city 

Pune 

locality 

Hinjewadi 

property_type 

Apartment 

transaction_type 

Buy / Rent 

bhk 

2 

price 

7800000 

area_sqft 

850 

status 

Ready to Move 

builder_or_owner 

ABC Developers 

project_name 

Green Heights 

C. Data Cleanup and Deduplication 

Cleanup Requirement 

Example 

Price normalization 

Rs 80 L, 80 Lac, 0.8 Cr -> 8000000 

Area normalization 

850 sq.ft. -> 850 

BHK normalization 

2 BHK Flat -> 2 

Locality normalization 

Hinjewadi / Hinjawadi handled consistently 

Status normalization 

Ready / Under Construction / Resale 

Missing fields 

Flag incomplete records 

Duplicate detection 

Same/similar title, locality, area, price, project/source URL 

Derived metric 

Calculate price per sqft 

D. Enrichment Requirements 

Enrichment Area 

Expected Output 

Builder/project reputation 

Builder name, project name, reputation score, completion track record, review summary, known risks 

Sentiment/public opinion 

Sentiment score, positive themes, negative themes, comment count, sentiment summary 

Trend/demand context 

Keyword, trend score, trend direction, compared localities, trend summary 

E. Comparative Dashboard 

Required Widget 

Purpose 

Requirement Summary 

Show parsed user requirement 

Matching Properties 

List matching properties 

Price Comparison 

Compare price and price per sqft by property/locality 

Locality Comparison 

Compare selected localities 

Builder/Project Reputation 

Show reputation score or summary 

Sentiment Summary 

Show positive/negative themes from comments/reviews 

Trend Context 

Show demand/search-interest style comparison 

Top Recommended Properties 

Ranked list with explanation 

8. Agentic Programming Expectations 

AI is required in the development workflow. Runtime AI features are optional but recommended. Teams must show evidence of agentic programming across the lifecycle. 

Stage 

Expected Evidence 

Requirement breakdown 

AI-generated scope, assumptions, and user stories 

Data-source planning 

AI-assisted source feasibility and compliance checklist 

Architecture/design 

Data model, ingestion flow, dashboard layout 

Implementation 

AI-assisted coding/refactoring 

Data cleanup logic 

AI-generated normalization and deduplication logic 

Testing 

AI-generated test cases 

Review 

AI-assisted code review and fixes 

Iteration 

At least one improvement from AI/tool feedback 

9. Required Resources 

Resource 

Required? 

Notes 

Auth provider account 

Yes 

Auth0/Firebase/Clerk/Supabase/etc. 

Property sample dataset 

Yes 

CSV/JSON fallback required 

Mock listing pages 

Recommended 

Safer than live scraping 

Builder/project data 

Recommended 

Can be sample/manual 

Sentiment/comment dataset 

Recommended 

YouTube/API/manual/sample comments accepted 

Trend dataset 

Recommended 

Manual/sample trend-style data accepted 

AI coding tools 

Yes 

Cursor, Copilot, Claude, ChatGPT, Gemini, etc. 

Git repository 

Yes 

Required for submission 

Hosting platform 

Preferred 

Vercel, Render, Netlify, Railway, Azure, etc. 

10. Suggested Implementation Approach 

Implement authentication and a protected dashboard route. 

Create property requirement input screen. 

Parse natural-language requirement into structured filters. 

Load property data from CSV/mock scraper/permitted source. 

Normalize price, area, BHK, locality, and status. 

Remove duplicate or similar listings. 

Add builder/project, sentiment, and trend enrichment using sample or permitted data. 

Build comparative dashboard and recommendation summary. 

Add test cases for parsing, cleanup, deduplication, and dashboard flow. 

Deploy or prepare local runnable demo. 

11. Success Criteria 

Success Criteria 

Required? 

Third-party authentication, login/logout, and protected dashboard route work 

Yes 

User can enter a property requirement and see parsed criteria 

Yes 

Property data is collected or ingested from permitted/sample sources 

Yes 

Data cleanup and deduplication work 

Yes 

Builder/project, sentiment/public-opinion, and trend/demand context are shown 

Yes 

Comparative dashboard and recommendation summary are displayed 

Yes 

At least 5-10 test cases or validation checks are present 

Yes 

App is deployed or locally runnable with clear instructions 

Yes 

Agentic programming evidence is shown 

Yes 

Data-source compliance note is included 

Yes 

12. Evaluation Criteria 

Area 

Weight 

Authentication and protected access 

10% 

Functional implementation 

30% 

Data collection, cleanup, and deduplication quality 

15% 

Comparative dashboard usefulness 

15% 

Builder/sentiment/trend enrichment 

10% 

Test cases and validation 

10% 

Agentic programming evidence 

10% 

13. Bonus / Extension Opportunities 

Extension 

Example 

Real permitted source integration 

Compliant live collection 

Multi-source comparison 

MagicBricks + Housing + NoBroker-style datasets 

Natural-language query refinement 

App asks follow-up questions 

AI recommendation explanation 

Explain why a property is recommended 

Advanced deduplication 

Fuzzy matching across portals 

Location scoring 

Commute, schools, hospitals, metro proximity using allowed data 

Investment score 

Trend + builder score + price movement 

Export report 

PDF/Markdown/CSV 

CI/CD and automated tests 

Deployment pipeline plus Playwright/Cypress/API tests 

14. Demo Expectations 

Login using third-party authentication. 

Enter a natural-language property requirement. 

Show parsed requirement. 

Load or collect property data. 

Show cleaned and deduplicated data. 

Show builder/project enrichment. 

Show sentiment/comment analysis. 

Show trend/demand context. 

Show comparative dashboard and recommendation summary. 

Show tests or validation evidence. 

Show deployed app or local runnable app. 

Explain how agentic programming was used. 

15. Submission Checklist 

Submission Item 

Required? 

Git repository link 

Yes 

README with setup steps 

Yes 

Auth configuration notes 

Yes 

Demo URL or local run instructions 

Yes 

Sample property dataset 

Yes 

Sample sentiment/comment dataset 

Yes 

Sample trend dataset 

Yes 

Test cases/test evidence 

Yes 

Agentic programming evidence 

Yes 

Known limitations 

Yes 

Compliance note on data sources used 

Yes 

Screenshots or short demo video 

Recommended 


```Agentic Programming Hackathon - Challenge Brief 

Real Estate Property Intelligence Dashboard using Agentic Programming 

| Attribute  | Details  |
| --- |  --- |
| Difficulty  | Advanced  |
| Recommended Team Profile  | Frontend/dashboarding, backend/API integration, data ingestion, data engineering, authentication, deployment, and strong agentic programming usage  |
| Core MVP Pillars  | Third-party authentication, functional implementation, test cases, and deployment/local runnable demo  |
| Runtime AI  | Optional but recommended for requirement parsing, sentiment summarization, recommendation explanation, or query refinement  |

1\. Summary 

Build a real estate property intelligence dashboard where a logged-in user can enter a natural-language property requirement. The application should collect or ingest property-related data from permitted sources or sample datasets, normalize and compare listings, enrich the analysis with builder/project reputation, public sentiment, and trend context, and present a comparative dashboard with recommendations. 

2\. Problem Statement 

Property buyers often compare listings across multiple platforms and external information sources. Data is scattered across listing portals, builder/project pages, locality discussions, YouTube reviews/comments, price trends, and search-interest signals. Users need a single comparative view that helps them evaluate properties against their requirements. 

3\. Objective 

The solution should support the following end-to-end flow: 

User requirement -> requirement parsing -> permitted data ingestion -> cleanup/deduplication -> enrichment -> comparative dashboard -> recommendation summary 

4\. MVP Scope 

| Area  | MVP Requirement  |
| --- |  --- |
| Authentication  | Third-party login/logout and protected dashboard route  |
| Requirement Input  | User can type a natural-language property requirement  |
| Requirement Parsing  | Extract city, locality, budget, BHK, buy/rent, status preference, and notes  |
| Data Collection / Ingestion  | Use permitted live sources, mock pages, CSV/JSON, or sample datasets  |
| Data Cleanup  | Normalize price, area, BHK, status, locality, and source  |
| Deduplication  | Detect duplicate or similar listings across sources  |
| Enrichment  | Add builder/project reputation, public sentiment, and trend context  |
| Dashboard  | Show comparative property insights and recommendations  |
| Tests  | Include test cases for parsing, cleanup, deduplication, and dashboard logic  |
| Deployment  | Hosted demo preferred; local runnable demo accepted with lower deployment score  |

5\. Authentication and Access Scope 

| Requirement  | Expectation  |
| --- |  --- |
| Third-party auth  | Auth0, Firebase Auth, Clerk, Supabase Auth, Azure Entra ID, Google login, or equivalent  |
| Login/logout  | User can log in and log out  |
| Protected route  | Main application/dashboard route requires login  |
| User identity  | Logged-in user name/email is visible or available in the app  |
| Password handling  | Teams must not build custom password storage or store raw passwords  |

6\. Data Source and Compliance Rules 

Teams may use MagicBricks, Housing.com, NoBroker, builder websites, YouTube, public trend sources, or other real-estate\-related sources only where collection is allowed. Teams must include a fallback dataset so the demo does not depend on live scraping. 

| Rule  | Requirement  |
| --- |  --- |
| Respect restrictions  | Check robots.txt, terms of use, and access permissions for each source  |
| No bypassing  | Do not bypass login walls, CAPTCHA, rate limits, or anti-bot controls  |
| No private data  | Do not collect personal phone numbers, private profiles, or sensitive contact data  |
| Responsible crawling  | Use low-volume, polite collection only where allowed  |
| Source tracking  | Store source name and URL where available  |
| Fallback data  | Provide CSV/mock/sample data for reliable demo execution  |
| Compliance note  | Submission must mention which sources were used and how data was collected  |

7\. Functional Requirements 

A. Natural-Language Property Requirement Input 

Example inputs: 

-   Looking for 2 BHK in Hinjewadi, Pune under 80 lakh, ready to move. 

-   Need a rental apartment near Whitefield Bangalore, 2 or 3 BHK, budget under 45k per month. 

-   Compare new projects in Wakad and Baner for investment under 1.2 crore. 

| Extracted Field  | Example  |
| --- |  --- |
| city  | Pune  |
| locality  | Hinjewadi  |
| transaction\_type  | Buy  |
| bhk  | 2  |
| budget\_max  | 8000000  |
| property\_type  | Apartment  |
| status\_preference  | Ready to Move  |
| preference\_notes  | Near IT parks  |

B. Property Data Fields 

| Required Field  | Example  |
| --- |  --- |
| property\_id  | PROP001  |
| title  | 2 BHK Apartment in Hinjewadi  |
| source  | Housing / MagicBricks / NoBroker / Mock  |
| source\_url  | Listing URL  |
| city  | Pune  |
| locality  | Hinjewadi  |
| property\_type  | Apartment  |
| transaction\_type  | Buy / Rent  |
| bhk  | 2  |
| price  | 7800000  |
| area\_sqft  | 850  |
| status  | Ready to Move  |
| builder\_or\_owner  | ABC Developers  |
| project\_name  | Green Heights  |

C. Data Cleanup and Deduplication 

| Cleanup Requirement  | Example  |
| --- |  --- |
| Price normalization  | Rs 80 L, 80 Lac, 0.8 Cr -> 8000000  |
| Area normalization  | 850 sq.ft. -> 850  |
| BHK normalization  | 2 BHK Flat -> 2  |
| Locality normalization  | Hinjewadi / Hinjawadi handled consistently  |
| Status normalization  | Ready / Under Construction / Resale  |
| Missing fields  | Flag incomplete records  |
| Duplicate detection  | Same/similar title, locality, area, price, project/source URL  |
| Derived metric  | Calculate price per sqft  |

D. Enrichment Requirements 

| Enrichment Area  | Expected Output  |
| --- |  --- |
| Builder/project reputation  | Builder name, project name, reputation score, completion track record, review summary, known risks  |
| Sentiment/public opinion  | Sentiment score, positive themes, negative themes, comment count, sentiment summary  |
| Trend/demand context  | Keyword, trend score, trend direction, compared localities, trend summary  |

E. Comparative Dashboard 

| Required Widget  | Purpose  |
| --- |  --- |
| Requirement Summary  | Show parsed user requirement  |
| Matching Properties  | List matching properties  |
| Price Comparison  | Compare price and price per sqft by property/locality  |
| Locality Comparison  | Compare selected localities  |
| Builder/Project Reputation  | Show reputation score or summary  |
| Sentiment Summary  | Show positive/negative themes from comments/reviews  |
| Trend Context  | Show demand/search-interest style comparison  |
| Top Recommended Properties  | Ranked list with explanation  |

8\. Agentic Programming Expectations 

AI is required in the development workflow. Runtime AI features are optional but recommended. Teams must show evidence of agentic programming across the lifecycle. 

| Stage  | Expected Evidence  |
| --- |  --- |
| Requirement breakdown  | AI-generated scope, assumptions, and user stories  |
| Data-source planning  | AI-assisted source feasibility and compliance checklist  |
| Architecture/design  | Data model, ingestion flow, dashboard layout  |
| Implementation  | AI-assisted coding/refactoring  |
| Data cleanup logic  | AI-generated normalization and deduplication logic  |
| Testing  | AI-generated test cases  |
| Review  | AI-assisted code review and fixes  |
| Iteration  | At least one improvement from AI/tool feedback  |

9\. Required Resources 

| Resource  | Required?  | Notes  |
| --- |  --- |  --- |
| Auth provider account  | Yes  | Auth0/Firebase/Clerk/Supabase/etc.  |
| Property sample dataset  | Yes  | CSV/JSON fallback required  |
| Mock listing pages  | Recommended  | Safer than live scraping  |
| Builder/project data  | Recommended  | Can be sample/manual  |
| Sentiment/comment dataset  | Recommended  | YouTube/API/manual/sample comments accepted  |
| Trend dataset  | Recommended  | Manual/sample trend-style data accepted  |
| AI coding tools  | Yes  | Cursor, Copilot, Claude, ChatGPT, Gemini, etc.  |
| Git repository  | Yes  | Required for submission  |
| Hosting platform  | Preferred  | Vercel, Render, Netlify, Railway, Azure, etc.  |

10\. Suggested Implementation Approach 

1.  Implement authentication and a protected dashboard route. 

2.  Create property requirement input screen. 

3.  Parse natural-language requirement into structured filters. 

4.  Load property data from CSV/mock scraper/permitted source. 

5.  Normalize price, area, BHK, locality, and status. 

6.  Remove duplicate or similar listings. 

7.  Add builder/project, sentiment, and trend enrichment using sample or permitted data. 

8.  Build comparative dashboard and recommendation summary. 

9.  Add test cases for parsing, cleanup, deduplication, and dashboard flow. 

10.  Deploy or prepare local runnable demo. 

11\. Success Criteria 

| Success Criteria  | Required?  |
| --- |  --- |
| Third-party authentication, login/logout, and protected dashboard route work  | Yes  |
| User can enter a property requirement and see parsed criteria  | Yes  |
| Property data is collected or ingested from permitted/sample sources  | Yes  |
| Data cleanup and deduplication work  | Yes  |
| Builder/project, sentiment/public-opinion, and trend/demand context are shown  | Yes  |
| Comparative dashboard and recommendation summary are displayed  | Yes  |
| At least 5-10 test cases or validation checks are present  | Yes  |
| App is deployed or locally runnable with clear instructions  | Yes  |
| Agentic programming evidence is shown  | Yes  |
| Data-source compliance note is included  | Yes  |

12\. Evaluation Criteria 

| Area  | Weight  |
| --- |  --- |
| Authentication and protected access  | 10%  |
| Functional implementation  | 30%  |
| Data collection, cleanup, and deduplication quality  | 15%  |
| Comparative dashboard usefulness  | 15%  |
| Builder/sentiment/trend enrichment  | 10%  |
| Test cases and validation  | 10%  |
| Agentic programming evidence  | 10%  |

13\. Bonus / Extension Opportunities 

| Extension  | Example  |
| --- |  --- |
| Real permitted source integration  | Compliant live collection  |
| Multi-source comparison  | MagicBricks \+ Housing + NoBroker\-style datasets  |
| Natural-language query refinement  | App asks follow-up questions  |
| AI recommendation explanation  | Explain why a property is recommended  |
| Advanced deduplication  | Fuzzy matching across portals  |
| Location scoring  | Commute, schools, hospitals, metro proximity using allowed data  |
| Investment score  | Trend + builder score + price movement  |
| Export report  | PDF/Markdown/CSV  |
| CI/CD and automated tests  | Deployment pipeline plus Playwright/Cypress/API tests  |

14\. Demo Expectations 

11.  Login using third-party authentication. 

12.  Enter a natural-language property requirement. 

13.  Show parsed requirement. 

14.  Load or collect property data. 

15.  Show cleaned and deduplicated data. 

16.  Show builder/project enrichment. 

17.  Show sentiment/comment analysis. 

18.  Show trend/demand context. 

19.  Show comparative dashboard and recommendation summary. 

20.  Show tests or validation evidence. 

21.  Show deployed app or local runnable app. 

22.  Explain how agentic programming was used. 

15\. Submission Checklist 

| Submission Item  | Required?  |
| --- |  --- |
| Git repository link  | Yes  |
| README with setup steps  | Yes  |
| Auth configuration notes  | Yes  |
| Demo URL or local run instructions  | Yes  |
| Sample property dataset  | Yes  |
| Sample sentiment/comment dataset  | Yes  |
| Sample trend dataset  | Yes  |
| Test cases/test evidence  | Yes  |
| Agentic programming evidence  | Yes  |
| Known limitations  | Yes  |
| Compliance note on data sources used  | Yes  |
| Screenshots or short demo video  | Recommended  |