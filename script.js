document.addEventListener('DOMContentLoaded', function() {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesArea = document.getElementById('messagesArea');
    const newChatBtn = document.getElementById('newChatBtn');
    const chatHistory = document.getElementById('chatHistory');
    const sendButton = document.querySelector('.send-btn');
    const chatSearchInput = document.getElementById('chatSearch');
    const clearInputBtn = document.getElementById('clearInputBtn');
    const historyEmptyState = document.getElementById('historyEmptyState');
    const messagesEmptyState = document.getElementById('messagesEmptyState');
    const initiateButton = document.getElementById('initiateButton');

    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(mobileMenuBtn);

    const sidebar = document.querySelector('.sidebar');

    const apiKeyInput = document.getElementById('apiKeyInput');
    const googleAiRadio = document.getElementById('googleAiRadio');
    const openAiRadio = document.getElementById('openAiRadio');

    let apiKey = '';
    let aiProvider = 'google';

    const STATE = {
        chatCounter: 0,
        currentChatId: null,
        chats: {},
        MAX_MESSAGES_PER_CHAT: 50,
        MAX_INPUT_LENGTH: 1000,
        STORAGE_KEY: 'senthrixChatState'
    };
    const utils = {
        generateId() {
            return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        },

        sanitizeInput(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML.trim();
        },

        truncateText(text, maxLength = 50) {
            return text.length > maxLength
                ? text.substring(0, maxLength) + '...'
                : text;
        },

        saveState() {
            try {
                localStorage.setItem(STATE.STORAGE_KEY, JSON.stringify({
                    chatCounter: STATE.chatCounter,
                    chats: STATE.chats
                }));
            } catch (error) {
                errorHandler.log('Failed to save state to local storage: ' + error);
            }
        },

        loadState() {
            try {
                const storedState = localStorage.getItem(STATE.STORAGE_KEY);
                if (storedState) {
                    const parsedState = JSON.parse(storedState);
                    STATE.chatCounter = parsedState.chatCounter || 0;
                    STATE.chats = parsedState.chats || {};
                    return true;
                }
                return false;
            } catch (error) {
                errorHandler.log('Failed to load state from local storage: ' + error);
                return false;
            }
        }
    };

    const errorHandler = {
        show(message, type = 'error') {
            const errorDiv = document.createElement('div');
            errorDiv.className = `${type}-state`;
            errorDiv.textContent = message;
            messagesArea.appendChild(errorDiv);

            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 3000);
        },

        log(error) {
            console.error('Senthrix Error:', error);
            this.show('An unexpected error occurred');
        }
    };

    const uiManager = {
        setLoading(isLoading) {
            messageInput.disabled = isLoading;
            sendButton.innerHTML = isLoading
                ? '<i class="fas fa-spinner fa-spin"></i>'
                : '<i class="fas fa-paper-plane"></i>';
            sendButton.disabled = isLoading;
        },

        autoResizeTextarea() {
            messageInput.style.height = 'auto';
            messageInput.style.height = `${messageInput.scrollHeight}px`;

            const maxHeight = parseInt(window.getComputedStyle(messageInput).maxHeight);
            messageInput.style.overflowY =
                messageInput.scrollHeight > maxHeight ? 'auto' : 'hidden';
        },

        updateEmptyStates() {
            const hasChats = Object.keys(STATE.chats).length > 0;
            const hasMessages = STATE.currentChatId &&
                STATE.chats[STATE.currentChatId]?.messages.length > 0;

            historyEmptyState.style.display = hasChats ? 'none' : 'flex';
            messagesEmptyState.style.display = hasMessages ? 'none' : 'flex';
        },
           showTypingIndicator() {
             const typingDiv = document.createElement('div');
             typingDiv.className = 'typing-indicator';
             let indicatorText = ["Reasoning...", "Deep Approach..."];
             let textIndex = 0;
             typingDiv.textContent = indicatorText[textIndex];
             typingDiv.classList.add('shining-text');

             const textInterval = setInterval(() => {
                 textIndex = (textIndex + 1) % indicatorText.length;
                 typingDiv.textContent = indicatorText[textIndex];
             }, 2000);

             typingDiv.dataset.textInterval = textInterval;
             messagesArea.appendChild(typingDiv);
             messagesArea.scrollTop = messagesArea.scrollHeight;
             return typingDiv;
         },

         hideTypingIndicator(typingDiv) {
             if (typingDiv && typingDiv.parentNode) {
                 clearInterval(typingDiv.dataset.textInterval);
                 typingDiv.parentNode.removeChild(typingDiv);
             }
         },
         async displayBotMessage(formatted) {
             return new Promise((resolve) => {
                 const messageDiv = document.createElement('div');
                 messageDiv.className = `message bot-message`;
                 messagesArea.appendChild(messageDiv);
                 messagesArea.scrollTop = messagesArea.scrollHeight;

                 let index = 0;
                 const typingInterval = setInterval(() => {
                     if (index < formatted.length) {
                         messageDiv.innerHTML = formatted.substring(0, index + 1);
                         messagesArea.scrollTop = messagesArea.scrollHeight;
                         index++;
                     } else {
                         clearInterval(typingInterval);
                         messageDiv.innerHTML = formatted;
                         Prism.highlightAll();
                         resolve();
                     }
                 }, 5);
             });
         }
     };

    const chatManager = {
        createNewChat(initialTitle = null) {
            try {
                const chatId = utils.generateId();
                const title = initialTitle || `Chat ${STATE.chatCounter + 1}`;
                STATE.chatCounter++;

                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                historyItem.dataset.chatId = chatId;
                historyItem.innerHTML = `
                    <i class="fas fa-message"></i>
                    <span class="chat-title">${utils.truncateText(title)}</span>
                    <i class="fas fa-edit edit-icon" title="Edit chat title"></i>
                    <i class="fas fa-trash delete-icon" title="Delete chat"></i>
                `;

                this.setupHistoryItemListeners(historyItem, chatId);
                chatHistory.appendChild(historyItem);

                STATE.chats[chatId] = {
                    messages: [],
                    title: title,
                    createdAt: new Date().toISOString()
                };

                this.switchChat(chatId);
                uiManager.updateEmptyStates();
                utils.saveState();

                return chatId;
            } catch (error) {
                errorHandler.log(error);
                return null;
            }
        },

        setupHistoryItemListeners(historyItem, chatId) {
            historyItem.addEventListener('click', (e) => {
                const isEditOrDelete =
                    e.target.classList.contains('delete-icon') ||
                    e.target.classList.contains('edit-icon');

                if (!isEditOrDelete) {
                    this.switchChat(chatId);
                }
            });

            const editIcon = historyItem.querySelector('.edit-icon');
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editChatTitle(chatId, historyItem);
            });

            const deleteIcon = historyItem.querySelector('.delete-icon');
            deleteIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(chatId);
            });
        },

        editChatTitle(chatId, historyItem) {
            const titleSpan = historyItem.querySelector('.chat-title');
            const currentTitle = titleSpan.textContent;

            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.className = 'edit-title-input';
            inputField.value = currentTitle;

            titleSpan.replaceWith(inputField);
            inputField.focus();
            inputField.select();

            const saveTitle = () => {
                const newTitle = utils.sanitizeInput(inputField.value.trim());
                if (newTitle && newTitle !== currentTitle) {
                    STATE.chats[chatId].title = newTitle;
                    titleSpan.textContent = utils.truncateText(newTitle);
                    utils.saveState();
                }
                inputField.replaceWith(titleSpan);
            };

            inputField.addEventListener('blur', saveTitle);
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveTitle();
            });
        },

        deleteChat(chatId) {
            if (Object.keys(STATE.chats).length <= 1) {
                errorHandler.show('Cannot delete the last chat', 'warning');
                return;
            }

            const historyItem = document.querySelector(
                `.history-item[data-chat-id="${chatId}"]`
            );

            if (historyItem) historyItem.remove();
            delete STATE.chats[chatId];

            if (STATE.currentChatId === chatId) {
                const remainingChats = Object.keys(STATE.chats);
                this.switchChat(remainingChats[0]);
            }

            uiManager.updateEmptyStates();
            utils.saveState();
        },

        switchChat(chatId) {
            if (!STATE.chats[chatId]) return;

            STATE.currentChatId = chatId;
            const currentChat = STATE.chats[chatId];

            messagesArea.innerHTML = '';

            if (currentChat && currentChat.messages) {
                currentChat.messages.forEach(msg => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `message ${msg.isUser ? 'user-message' : 'bot-message'}`;
                    messageDiv.innerHTML = msg.text;
                    messagesArea.appendChild(messageDiv);
                    messagesArea.scrollTop = messagesArea.scrollHeight;
                      if (!msg.isUser) {
                         Prism.highlightAll();
                     }
                });
            }


            document.querySelectorAll('.history-item')
                .forEach(item => {
                    item.classList.remove('active');
                    if (item.dataset.chatId === chatId) {
                        item.classList.add('active');
                    }
                });

            messageInput.value = '';
            uiManager.autoResizeTextarea();
            uiManager.updateEmptyStates();
        },

        addMessage(chatId, text, isUser) {
            const chat = STATE.chats[chatId];
             if (!chat) {
                console.error("Chat not found:", chatId);
                return;
            }
            if (!chat.messages){
                chat.messages = [];
            }
            chat.messages.push({text: text, isUser: isUser});
            utils.saveState();

        }
    };

    function optimizePrompt(message, conversationHistory) {
        let optimizedPrompt = `Engage in deep reasoning and think step-by-step to provide the most comprehensive and accurate answer. Consider the conversation history for context.  \n\n`;
        conversationHistory.forEach(msg => {
            optimizedPrompt += `${msg.isUser ? "User: " : "AI: "} ${msg.text}\n`;
        });
        optimizedPrompt += `User's current message: ${message}\n\n`;
        optimizedPrompt += `AI Response: `;
        return optimizedPrompt;
    }


    async function callGoogleAI(apiKey, message, conversationHistory = []) {
          const optimizedPrompt = optimizePrompt(message, conversationHistory);
          let prompt = optimizedPrompt;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        const data = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            const botResponse = responseData.candidates[0].content.parts[0].text;
            return botResponse;

        } catch (error) {
            errorHandler.log(`Google AI API Error: ${error}`);
            return "Error getting response from Google AI.";
        }
    }

    async function callOpenAI(apiKey, message, conversationHistory = []) {
        const optimizedPrompt = optimizePrompt(message, conversationHistory);
        const messages = conversationHistory.map(msg => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text
        }));
        messages.push({role: "user", content: optimizedPrompt});

        const url = 'https://api.openai.com/v1/chat/completions';
        const data = {
            model: "gpt-3.5-turbo",
            messages: messages
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const responseData = await response.json();
            const botResponse = responseData.choices[0].message.content;
            return botResponse;

        } catch (error) {
            errorHandler.log(`OpenAI API Error: ${error}`);
            return "Error getting response from OpenAI.";
        }
    }

    function setupEventListeners() {
        messageForm.addEventListener('submit', handleMessageSubmit);
        messageInput.addEventListener('input', uiManager.autoResizeTextarea);
        messageInput.addEventListener('keypress', handleKeyPress);
        newChatBtn.addEventListener('click', () => chatManager.createNewChat());
        clearInputBtn.addEventListener('click', clearInput);
        chatSearchInput.addEventListener('input', handleChatSearch);

        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (event) => {
            if (window.innerWidth <= 768 && !sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        });

        window.addEventListener('error', (event) => {
            errorHandler.log(event.error);
        });

        googleAiRadio.addEventListener('change', () => {
            aiProvider = 'google';
        });

        openAiRadio.addEventListener('change', () => {
            aiProvider = 'openai';
        });
    }

    async function handleMessageSubmit(e) {
        e.preventDefault();
        const message = messageInput.value.trim();
        apiKey = apiKeyInput.value.trim();

        if (!message || !STATE.currentChatId) return;

        if (message.length > STATE.MAX_INPUT_LENGTH) {
            errorHandler.show('Message too long', 'warning');
            return;
        }

        if (!apiKey) {
            errorHandler.show('Please enter an API key. This platform is developed and made by CraftedCodeX', 'warning');
            return;
        }

        uiManager.setLoading(true);
         chatManager.addMessage(STATE.currentChatId, message, true);
        chatManager.switchChat(STATE.currentChatId);
        messageInput.value = '';
        uiManager.autoResizeTextarea();

        let botResponse = "";
        let formattedResponse = "";

        try {
            const typingIndicator = uiManager.showTypingIndicator();
            const currentChat = STATE.chats[STATE.currentChatId];

            let conversationHistory = [];
             if (currentChat && currentChat.messages) {
                 conversationHistory = currentChat.messages;
             }

            if (aiProvider === 'google') {
                botResponse = await callGoogleAI(apiKey, message, conversationHistory);
            } else if (aiProvider === 'openai') {
                botResponse = await callOpenAI(apiKey, message, conversationHistory);
            } else {
                botResponse = "Invalid AI provider selected.";
            }

            formattedResponse = botResponse
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/---/g, '<hr>')
                    .replace(/\n/g, '<br>');

            let languageClass = '';
            if (botResponse.startsWith("#!")) {
                 languageClass = 'language-javascript'; // Default, can be improved with better detection
                 formattedResponse = `<pre><code class="${languageClass}">${utils.sanitizeInput(botResponse)}</code></pre>`;
                 if (message.toLowerCase().includes("javascript") || message.toLowerCase().includes("js")) languageClass = 'language-javascript';
                 if (message.toLowerCase().includes("python")) languageClass = 'language-python';
                 if (message.toLowerCase().includes("css")) languageClass = 'language-css';
                 if (message.toLowerCase().includes("html")) languageClass = 'language-html';
                 if (message.toLowerCase().includes("java")) languageClass = 'language-java';
                 formattedResponse = `<pre><code class="${languageClass}">${utils.sanitizeInput(botResponse.replace(/^#!/, '').trim())}</code></pre>`; // Remove #! and trim
             }

            formattedResponse += `<br><span style="font-size: 0.8em; color: #ccc;">Visit <a href="https://craftedcodex.vercel.app/" target="_blank" style="color: #00d2ff;">CraftedCodeX</a> for more exciting projects!</span>`;
             await uiManager.displayBotMessage(formattedResponse);
             uiManager.hideTypingIndicator(typingIndicator);
             chatManager.addMessage(STATE.currentChatId,formattedResponse, false);

        } catch (error) {
            botResponse = "Failed to get response from AI: " + error;
            errorHandler.log(error);
            formattedResponse = botResponse;
             await uiManager.displayBotMessage(formattedResponse);
             uiManager.hideTypingIndicator(typingIndicator);
              chatManager.addMessage(STATE.currentChatId,formattedResponse, false);
        }

        uiManager.setLoading(false);
         chatManager.switchChat(STATE.currentChatId);
     }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            messageForm.dispatchEvent(new Event('submit'));
        }
    }

    function clearInput() {
        messageInput.value = '';
        uiManager.autoResizeTextarea();
    }

    function handleChatSearch() {
        const searchTerm = chatSearchInput.value.trim().toLowerCase();
        const historyItems = document.querySelectorAll('.history-item');

        historyItems.forEach(item => {
            const title = item.querySelector('.chat-title')
                .textContent.toLowerCase();

            item.style.display = title.includes(searchTerm) ? '' : 'none';
        });
    }

    function init() {
        setupEventListeners();

        const hasLoadedState = utils.loadState();

        const chatIds = Object.keys(STATE.chats);

        const startChat = () => {
            if (hasLoadedState && chatIds.length > 0) {
                chatIds.forEach(chatId => {
                    const chat = STATE.chats[chatId];
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.dataset.chatId = chatId;
                    historyItem.innerHTML = `
                        <i class="fas fa-message"></i>
                        <span class="chat-title">${utils.truncateText(chat.title)}</span>
                        <i class="fas fa-edit edit-icon" title="Edit chat title"></i>
                        <i class="fas fa-trash delete-icon" title="Delete chat"></i>
                    `;
                    chatManager.setupHistoryItemListeners(historyItem, chatId);
                    chatHistory.appendChild(historyItem);
                })
                 chatManager.switchChat(chatIds[0]);
            } else {
                chatManager.createNewChat();
            }
        }

        setTimeout(startChat, 1500);
    }

    init();
});
