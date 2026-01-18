define(["require", "exports", "WoltLabSuite/Core/Component/Ckeditor/Event", "WoltLabSuite/Core/Language", "WoltLabSuite/Core/Component/Ckeditor", "WoltLabSuite/Core/Component/Dialog", "WoltLabSuite/Core/Ui/Notification", "WoltLabSuite/Core/Ajax/Backend"], function (require, exports, Event_1, Language_1, Ckeditor_1, Dialog_1, Notification_1, Backend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AivorEditor = void 0;
    class AivorEditor {
        container;
        #textarea;
        #dialog;
        #editor;
        constructor(textarea) {
            this.#textarea = textarea;
            (0, Event_1.listenToCkeditor)(this.#textarea).setupConfiguration(({ configuration }) => {
                configuration.woltlabBbcode.push({
                    icon: "comment-dots;true",
                    name: "aivorEditor",
                    label: (0, Language_1.getPhrase)("wcf.aivor.editor.button.label"),
                });
            });
            (0, Event_1.listenToCkeditor)(this.#textarea).ready(({ ckeditor }) => {
                this.#editor = ckeditor;
                this.setupBbcode(ckeditor);
            });
        }
        setupBbcode(ckeditor) {
            ckeditor.sourceElement.addEventListener("ckeditor5:bbcode", (event) => {
                const { bbcode } = event.detail;
                if (bbcode === "aivorEditor") {
                    event.preventDefault();
                    this.show();
                }
            });
        }
        show() {
            if (!this.#dialog) {
                this.#dialog = this.#createDialog();
            }
            this.#dialog.show((0, Language_1.getPhrase)("wcf.aivor.editor.button.label"));
        }
        #createDialog() {
            const dialog = (0, Dialog_1.dialogFactory)()
                .fromId("aivorEditorDialog")
                .asPrompt({
                primary: (0, Language_1.getPhrase)("wcf.aivor.editor.submit"),
            });
            // prefill topic
            dialog.content.querySelector("#topic").value = this.#getTopic();
            dialog.addEventListener("primary", () => {
                this.#fireRequest({
                    topic: dialog.content.querySelector("#topic").value,
                    keywords: dialog.content.querySelector("#keywords").value,
                    role: dialog.content.querySelector("#role").value,
                    contentType: dialog.content.querySelector("#contentType").value,
                    targetAudience: dialog.content.querySelector("#targetAudience").value,
                });
            });
            return dialog;
        }
        async #fireRequest(data) {
            (0, Notification_1.show)("wcf.aivor.editor.confirm", null, "warning");
            const dialogTemplate = document.getElementById("aivorEditorDialog");
            const response = (await (0, Backend_1.prepareRequest)(dialogTemplate.dataset.endpoint)
                .post(data)
                .fetchAsJson());
            if ("message" in response) {
                if (response.error) {
                    (0, Notification_1.show)(response.error, null, "error");
                    return;
                }
                this.#getEditor().setHtml(response.message);
            }
            else {
                // failure
                (0, Notification_1.show)((0, Language_1.getPhrase)("wcf.aivor.editor.error"), null, "error");
            }
        }
        #getEditor() {
            if (this.#editor === undefined) {
                this.#editor = (0, Ckeditor_1.getCkeditor)(this.#textarea);
            }
            return this.#editor;
        }
        #getTopic() {
            let topic = "";
            const contentTitle = document.querySelector("h1.contentTitle");
            if (contentTitle) {
                topic = contentTitle.textContent;
            }
            const title1 = document.getElementById("title1");
            if (title1) {
                topic = title1.value;
            }
            const title0 = document.getElementById("title0");
            if (title0) {
                topic = title0.value;
            }
            const title = document.getElementById("title");
            if (title) {
                topic = title.value;
            }
            return topic;
        }
    }
    exports.AivorEditor = AivorEditor;
    exports.default = AivorEditor;
});
