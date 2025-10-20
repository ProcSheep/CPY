
  // 数据管理模块
  const ChatData = {
      // 初始化本地存储
      init() {
          if (!localStorage.getItem('ai_chat_history')) {
              localStorage.setItem('ai_chat_history', JSON.stringify({}));
          }
          
          if (!localStorage.getItem('ai_current_chat_id')) {
              const firstChatId = this.createNewChat();
              localStorage.setItem('ai_current_chat_id', firstChatId);
          }
          
          if (!localStorage.getItem('ai_model_settings')) {
              localStorage.setItem('ai_model_settings', JSON.stringify({
                  provider: 'deepinfra/fp8',
                  model: 'mistralai/mistral-nemo'
              }));
          }
      },
      
      // 创建新对话
      createNewChat() {
          const now = new Date();
          const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          const defaultName = `${dateStr} ${timeStr}`;
          
          const chatId = Date.now().toString();
          const history = this.getChatHistory();
          
          history[chatId] = {
              id: chatId,
              name: defaultName,
              messages: []
          };
          
          localStorage.setItem('ai_chat_history', JSON.stringify(history));
          return chatId;
      },
      
      // 获取所有对话历史
      getChatHistory() {
          return JSON.parse(localStorage.getItem('ai_chat_history') || '{}'); // 对象
      },
      
      // 获取当前对话
      getCurrentChat() {
          const chatId = localStorage.getItem('ai_current_chat_id');
          const history = this.getChatHistory();
          return history[chatId] || null;
      },
      
      // 切换对话
      switchChat(chatId) {
          localStorage.setItem('ai_current_chat_id', chatId);
      },
      
      // 添加消息到当前对话
      addMessage(content, isUser = true) {
          const chatId = localStorage.getItem('ai_current_chat_id');
          const history = this.getChatHistory();
          
          if (history[chatId]) {
              const message = {
                  id: Date.now().toString(),
                  content,
                  isUser,
                  timestamp: new Date().toISOString()
              };
              
              history[chatId].messages.push(message);
              localStorage.setItem('ai_chat_history', JSON.stringify(history));
              return message;
          }
          return null;
      },
      
      // 重命名对话
      renameChat(chatId, newName) {
          const history = this.getChatHistory();
          if (history[chatId]) {
              history[chatId].name = newName;
              localStorage.setItem('ai_chat_history', JSON.stringify(history));
              return true;
          }
          return false;
      },
      
      // 获取模型设置
      getModelSettings() {
          return JSON.parse(localStorage.getItem('ai_model_settings') || '{"provider":"deepinfra/fp8","model":"mistralai/mistral-nemo"}');
      },
      
      // 保存模型设置
      saveModelSettings(provider, model) {
          localStorage.setItem('ai_model_settings', JSON.stringify({ provider, model }));
      }
  };

  // UI渲染模块
  const ChatUI = {
      // 初始化UI
      init() {
          this.chatContainer = document.getElementById('chat-container');
          this.historyList = document.getElementById('history-list');
          this.userInput = document.getElementById('user-input');
          this.chatForm = document.getElementById('chat-form');
          this.currentProviderEl = document.getElementById('current-provider');
          this.currentModelEl = document.getElementById('current-model');
          
          // 模态框元素
          this.modelModal = document.getElementById('model-modal');
          this.renameModal = document.getElementById('rename-modal');
          this.providerInput = document.getElementById('provider-input');
          this.modelInput = document.getElementById('model-input');
          this.modelForm = document.getElementById('model-form');
          this.renameInput = document.getElementById('rename-input');
          this.renameChatId = document.getElementById('rename-chat-id');
          this.renameForm = document.getElementById('rename-form');
          
          this.loadEventListeners();
          this.renderModelSettings();
          this.renderHistoryList();
          this.renderCurrentChat();
      },
      
      // 加载事件监听器
      loadEventListeners() {
          // 发送消息
          this.chatForm.addEventListener('submit', (e) => {
              e.preventDefault();
              const content = this.userInput.value.trim();
              if (content) {
                  this.sendMessage(content);
                  this.userInput.value = '';
              }
          });
          
          // 新对话
          document.getElementById('new-chat-btn').addEventListener('click', () => {
              const newChatId = ChatData.createNewChat();
              ChatData.switchChat(newChatId);
              this.renderHistoryList();
              this.clearChatContainer();
              this.addSystemMessage('你好！我是AI助手，有什么可以帮助你的吗？');
          });
          
          // 更改模型按钮
          document.getElementById('change-model-btn').addEventListener('click', () => {
              const settings = ChatData.getModelSettings();
              this.providerInput.value = settings.provider;
              this.modelInput.value = settings.model;
              this.modelModal.classList.add('active');
          });
          
          // 取消模型更改
          document.getElementById('cancel-modal').addEventListener('click', () => {
              this.modelModal.classList.remove('active');
          });
          
          // 提交模型更改
          this.modelForm.addEventListener('submit', (e) => {
              e.preventDefault();
              const provider = this.providerInput.value.trim()
              const model = this.modelInput.value.trim() || 'mistralai/mistral-nemo';
              ChatData.saveModelSettings(provider, model);
              this.renderModelSettings();
              this.modelModal.classList.remove('active');
          });
          
          // 取消重命名
          document.getElementById('cancel-rename').addEventListener('click', () => {
              this.renameModal.classList.remove('active');
          });
          
          // 提交重命名
          this.renameForm.addEventListener('submit', (e) => {
              e.preventDefault();
              const newName = this.renameInput.value.trim();
              const chatId = this.renameChatId.value;
              
              if (newName && chatId) {
                  ChatData.renameChat(chatId, newName);
                  this.renderHistoryList();
                  this.renameModal.classList.remove('active');
              }
          });
      },
    sendMessage(content) {
        // 添加用户消息（这部分 content 传递正确）
        const userMessage = ChatData.addMessage(content, true);
        this.addMessageToUI(userMessage);
        
        // AI回复（修正异步处理）
        this.sendMessageToOpenAI(content).then(res => {
            const aiMessage = ChatData.addMessage(res.content, false);
            this.addMessageToUI(aiMessage);
        }).catch(err => {
            console.error('请求出错:', err);
            const errorMessage = ChatData.addMessage('抱歉，获取回复失败，请重试', false);
            this.addMessageToUI(errorMessage);
        });
    },
    async sendMessageToOpenAI(content) {
        try {
            // 获取供应商
            // const provider = localStorage.getItem("ai_model_settings").provider || "deepinfra/fp8"
            const modelSettingStr = localStorage.getItem("ai_model_settings")
            const modelSetting = modelSettingStr ? JSON.parse(modelSettingStr) : {}
            const provider = modelSetting.provider
            console.log('provider',provider)
            // console.log('provider',provider)
            // 1. 给 fetch 加 await，获取响应对象
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "mistralai/mistral-nemo",
                    "provider": {
                        "order": [provider]
                    },
                    "messages": [
                        {
                            "role": "user",
                            "content": content  // 这里 content 传递正确，无需用 `${content}` 拼接
                        }
                    ]
                })
            });

            // 2. 解析响应为 JSON（接口返回的是 JSON 格式）
            const data = await response.json();

            // 3. 检查接口是否返回成功（HTTP 状态码 200-299）
            if (!response.ok) {
                throw new Error(`接口错误: ${data.error?.message || '未知错误'}`);
            }

            console.log(data)
            // 4. 返回 AI 回复内容（确保结构正确）
            return data.choices[0].message;

        } catch (error) {
            console.error('OpenAI API 错误:', error);
            throw error; // 让调用方的 catch 处理
        }
    },
      
      // 添加消息到UI
      addMessageToUI(message) {
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${message.isUser ? 'user' : 'ai'}`;
          
          const contentDiv = document.createElement('div');
          contentDiv.className = 'message-content';
          contentDiv.textContent = message.content;
          
          messageDiv.appendChild(contentDiv);
          this.chatContainer.appendChild(messageDiv);
          this.scrollToBottom();
      },
      
      // 添加系统消息
      addSystemMessage(content) {
          const messageDiv = document.createElement('div');
          messageDiv.className = 'message ai';
          
          const contentDiv = document.createElement('div');
          contentDiv.className = 'message-content';
          contentDiv.textContent = content;
          
          messageDiv.appendChild(contentDiv);
          this.chatContainer.appendChild(messageDiv);
          this.scrollToBottom();
      },
      
      // 渲染当前对话
      renderCurrentChat() {
          this.clearChatContainer();
          const currentChat = ChatData.getCurrentChat();
          
          if (!currentChat || currentChat.messages.length === 0) {
              this.addSystemMessage('你好！我是AI助手，有什么可以帮助你的吗？');
              return;
          }
          
          currentChat.messages.forEach(message => {
              this.addMessageToUI(message);
          });
      },
      
      // 渲染历史列表
      renderHistoryList() {
          this.historyList.innerHTML = '';
          const history = ChatData.getChatHistory();
          const currentChatId = localStorage.getItem('ai_current_chat_id');
          
          // 将历史记录按时间倒序排列
          const sortedChats = Object.values(history).sort((a, b) => 
              b.id - a.id
          );
          
          sortedChats.forEach(chat => {
              const li = document.createElement('li');
              li.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
              li.dataset.chatId = chat.id;
              
              const nameSpan = document.createElement('span');
              nameSpan.className = 'history-name';
              nameSpan.textContent = chat.name;
              
              const renameBtn = document.createElement('button');
              renameBtn.className = 'rename-btn';
              renameBtn.textContent = '重命名';
              renameBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.renameInput.value = chat.name;
                  this.renameChatId.value = chat.id;
                  this.renameModal.classList.add('active');
              });
              
              li.appendChild(nameSpan);
              li.appendChild(renameBtn);
              
              li.addEventListener('click', () => {
                  ChatData.switchChat(chat.id);
                  this.renderHistoryList();
                  this.renderCurrentChat();
              });
              
              this.historyList.appendChild(li);
          });
      },
      
      // 渲染模型设置
      renderModelSettings() {
          const settings = ChatData.getModelSettings();
          this.currentProviderEl.textContent = settings.provider;
          this.currentModelEl.textContent = settings.model;
      },
      
      // 清空聊天容器
      clearChatContainer() {
          this.chatContainer.innerHTML = '';
      },
      
      // 滚动到底部
      scrollToBottom() {
          this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
      }
  };

  // 初始化应用
  document.addEventListener('DOMContentLoaded', () => {
      ChatData.init();
      ChatUI.init();
  });