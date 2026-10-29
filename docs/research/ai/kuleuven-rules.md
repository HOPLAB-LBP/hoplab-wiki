# KU Leuven rules

These rules come from the KU Leuven guidelines on generative AI and apply to all staff and students. This page gives the parts that matter most for our work and links to the [KU Leuven pages](#ku-leuven-pages) for the rest; some of them need your KU Leuven login. Our own agreements, which build on these rules, are in the [lab guidelines](lab-guidelines.md).

!!! abstract "In short"
    - Confidential material, such as participant data, unpublished work and PDFs of papers, only goes into [Copilot with your KU Leuven login](#which-tool-for-which-data).
    - [AI that acts on its own](#ai-that-acts-on-its-own), such as agentic browsers and assistants that work across your computer, is not permitted. Coding agents have no clear rule yet: in the lab they ask before every step.
    - You are [responsible for the output](#check-what-ai-gives-you): check facts, sources and code.
    - [Say how you used AI](#say-how-you-used-it) whenever it produced content. AI is never an author.
    - Do not use AI to [review a manuscript or a proposal](#peer-review).

---

## Which tool for which data

KU Leuven has a data protection agreement for one AI assistant: Microsoft Copilot, used at [copilot.cloud.microsoft](https://copilot.cloud.microsoft/) while you are logged in with your KU Leuven account. Microsoft does not use what you enter there to train its models, and the data stay in European data centres. It is the only AI tool you may use with confidential data.

Every other assistant (ChatGPT, Claude, Gemini, Mistral and so on, paid accounts included) may only be used with information that is not confidential. GitHub Copilot is a different product from Microsoft Copilot, and KU Leuven is still checking whether the agreement covers it.

<div class="yn-table" markdown>

| What you want to enter | Copilot with KU Leuven login | Other AI tools |
|---|---|---|
| Public information: general questions, public web pages, code you have published | Yes | Yes |
| Unpublished research: data, results, plans, drafts of papers or grant applications, internal meeting notes | Yes | No |
| Personal data, including pseudonymised participant data | Yes | No |
| Health data and other special categories, such as brain MRI and screening forms | Only pseudonymised | No |
| Copyright-protected material, such as PDFs of papers and books | Yes | No |
| Data under a non-disclosure agreement, or with commercial potential | Yes | No |

</div>

When data of different levels are mixed, the strictest level applies.

??? info "Why unpublished research counts as confidential"
    Putting unpublished data into a cloud tool shares them before they are published. KU Leuven also owns the research data its staff produce ([regulations on intellectual property](https://admin.kuleuven.be/reglementen/en/research/intranet/intellectual-properties#autotoc-item-autotoc-3), login). Our [RDM rules](../rdm/SOPs.md) explain why our study data count as confidential or strictly confidential.

??? info "Results per participant are not anonymous"
    RDMs, decoding accuracies or averaged values stored under a participant code such as `sub-01` are pseudonymised data, not anonymous data. They have to be made anonymous before any tool other than Copilot sees them. Ask the [CTC](https://gbiomed.kuleuven.be/english/ctc/) whether your study needs an ethical review for this. The KU Leuven guidance on [personal data](https://www.kuleuven.be/rdm/en/guidance/legal-ethical/personal_data) explains the difference.

??? info "Licences for other tools"
    Free consumer accounts are not permitted for professional use. You need a licence, bought following the [SaaS guidelines](https://admin.kuleuven.be/icts/associatienet/saas) (login, in Dutch). KU Leuven has no plans for institution-wide licences for Claude or ChatGPT. For specific uses, its bonsAI environment may be an option.

??? failure "Confidential data ended up in the wrong tool"
    Report it to the owner of the data and to [privacy@kuleuven.be](mailto:privacy@kuleuven.be).

## AI that acts on its own

Agentic AI does more than answer: it opens files, runs programs, fills in forms or pays for you. KU Leuven's rules of thumb are to use AI that advises you and avoid AI that acts for you, and to give an AI system access only to data you would be willing to make public. In practice:

- agentic browsers (Comet, Atlas) and system assistants that work across your computer (OpenClaw, Claude Cowork, Perplexity Computer) are not permitted until further notice, and Microsoft's Copilot Cowork is not permitted yet either;
- tools that act on their own are not permitted unless KU Leuven says otherwise;
- agents that plan and carry out tasks only after you approve them are judged case by case.

Coding agents such as Claude Code and Codex are not named in these rules, and KU Leuven has no clearer framework for them yet. Until it has, be cautious. Before you install one on a KU Leuven computer, ask local IT support (for us, [PPW dICT](http://ppw.kuleuven.be/dict)). In the lab, a coding agent asks before every file edit and every command: no auto mode, no auto-accepted edits and no mode that skips approval. The rest of how we use coding agents is in the [lab guidelines](lab-guidelines.md).

??? info "Why KU Leuven is careful with agents"
    KU Leuven considers the combination of autonomy, broad access and unreliable input high risk. Unreliable input includes prompt injection: instructions hidden in a document or web page that the AI then follows.

## Check what AI gives you

You are responsible for what you put into an AI tool and for what you do with its output, including all work you hand in or publish. AI output can sound convincing and still be wrong, so:

- check facts, and check that every source exists and supports the claim;
- check generated code thoroughly: code that runs without errors can still do the wrong thing, and it may reuse code under a licence that does not fit your use;
- never use AI to fabricate data or figures, or to paraphrase someone else's text past a plagiarism check;
- ask whether AI adds anything to the task at all, since every request costs energy.

## Say how you used it

KU Leuven asks you to be open about AI whenever it produced new content. Hiding it is a violation of research integrity under the European Code of Conduct for Research Integrity (2023).

- In papers and grant applications, state the use in the Methods or the Acknowledgements. This applies to text about existing knowledge or new ideas, to code, to synthetic data and to figures. Code generation must be stated explicitly, with a reference to the tool. Help with the language of a text you wrote yourself needs no statement.
- An AI tool is never an author.
- When AI generates ideas or text for you, keep its raw output: the KU Leuven research data policy asks for an audit trail.

[Resources](resources.md#templates-for-disclosure) has sentences you can adapt.

??? info "Theses, journals and funders"
    - A PhD thesis describes the use of generative AI like any other method. In the Doctoral School Humanities and Social Sciences every thesis needs a statement, even if you did not use AI, following its [template](https://www.kuleuven.be/genai/generative-ai-and-doctoral-thesis.pdf), and blocks of text generated by AI are not allowed. Other doctoral schools have their own form.
    - Master's students follow the research guidelines and any rules of their programme or course.
    - Journals and funders can be stricter, so check their policy as well.

## Peer review

Do not use generative AI to evaluate a manuscript or a project proposal, neither to write the review nor to summarise the document. These documents are confidential, and the evaluation needs your own expertise. You may improve the language of a review you wrote yourself, with a tool that does not store or reuse the text.

## Training and questions

- The [AI bootcamp](https://admin.kuleuven.be/mykuleuven/en/theme/hr-wellbeing/training-talent/thematic/ict/ai/ai-bootcamp) (login) is KU Leuven's online introduction for staff, in English or Dutch, and takes four to six hours. It includes what responsible use at KU Leuven looks like.
- For questions on AI in research, write to [researchintegrity@kuleuven.be](mailto:researchintegrity@kuleuven.be); on research data and AI, to [rdm@kuleuven.be](mailto:rdm@kuleuven.be). KU Leuven keeps a [list of contacts](https://admin.kuleuven.be/mykuleuven/en/theme/hr-wellbeing/training-talent/thematic/ict/ai/#questions) (login) for other topics.

## KU Leuven pages

- [Generative AI at KU Leuven](https://www.kuleuven.be/english/genai): the starting page.
- [Five key principles](https://www.kuleuven.be/english/genai/principles): the basis of all KU Leuven rules, with the data rules.
- [GenAI tools at KU Leuven](https://www.kuleuven.be/english/genai/tools-overview) (login): what Copilot guarantees, and other tools by task (translation, literature, code).
- [Agentic AI](https://www.kuleuven.be/english/genai/agentic-ai) (login): what is not permitted, and why.
- [Data classification](https://admin.kuleuven.be/privacy/intranet/ict-aanpak-iv) (login): the three confidentiality levels.
- [Personal data](https://www.kuleuven.be/rdm/en/guidance/legal-ethical/personal_data) (RDM guidance): what counts as personal, pseudonymised and anonymous data.
- [GenAI in research](https://research.kuleuven.be/en/integrity-ethics/integrity/practices/genai/use-genai-research) and [transparency](https://research.kuleuven.be/en/integrity-ethics/integrity/practices/genai/transparency): what to check and what to state for each kind of use.
- [Guidelines for students](https://www.kuleuven.be/english/education/student/educational-tools/responsible-use-of-generative-artificial-intelligence).
- [Charter for AI-assisted coding](https://admin.kuleuven.be/icts/gen-ai/charter) (login): the rules ICTS set for its own developers; our guideline on coding agents follows it.
- [Living guidelines on the responsible use of generative AI in research](https://research-and-innovation.ec.europa.eu/document/2b6cf7e5-36ac-41cb-aab5-0d32050143dc_en): the European framework (third version, May 2026).

## Where next?

<div class="grid cards" markdown>

- :material-account-group-outline: **Lab guidelines**

    ---

    What we agree on in the Hoplab, on top of these rules.

    [Lab guidelines](lab-guidelines.md)

- :material-toolbox-outline: **Resources**

    ---

    Settings files, skills and templates that help you follow the rules.

    [Resources](resources.md)

</div>

<!--
__TODO__: [Andrea] Recheck the KU Leuven rules when its GenAI pages change (tools overview compiled April 2026, agentic AI rules "until further notice"). (Recurring.)
__TODO__: [Andrea] GitHub Copilot: update "Which tool for which data" once Research Integrity has the answer from ICTS (pending since 2026-10-27); add a link for bonsAI. (Waiting for answer.)
-->
