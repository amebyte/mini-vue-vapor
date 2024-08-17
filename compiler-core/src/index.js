      // 定义一些常用的字符编码，用于在解析过程中识别特定的字符
      const CharCodes = {
        'Tab': 0x9, // "\t"
        'NewLine': 0xa, // "\n"
        'FormFeed': 0xc, // "\f"
        'CarriageReturn': 0xd, // "\r"
        'Lt': 0x3c, // "<"
        'Gt': 0x3e, // ">"
        'Space': 0x20, // " "
        'Slash': 0x2f, // "/"
        'UpperA': 0x41, // "A"
        'LowerA': 0x61, // "a"
        'UpperZ': 0x5a, // "Z"
        'LowerZ': 0x7a, // "z"
      }
      const State = {
        'Text': 1, // 文本状态
        'InterpolationOpen': 2, // 插值开始状态
        'Interpolation': 3, // 插值状态
        'InterpolationClose': 4, // 插值结束状态
        'BeforeTagName': 5, // 标签名前状态
        'InTagName': 6, // 标签名状态
        'BeforeAttrName': 7, // 属性名前状态
        'BeforeClosingTagName': 8, // 结束标签名前状态
        'InClosingTagName': 9, // 结束标签名状态
        'AfterClosingTagName': 10 // 结束标签名后状态
      }
      // 模板 AST 节点类型
      const NodeTypes = {
        'ROOT': 1,
        'ELEMENT': 2,
        'TEXT': 3,
        'COMMENT': 4,
        'SIMPLE_EXPRESSION': 5,
        'INTERPOLATION': 6,
      }

      const ElementTypes = {
        'ELEMENT': 1,
        'COMPONENT': 2,
        'SLOT': 3,
        'TEMPLATE': 4,
      }

      // 创建 AST 根节点
      function createRoot(
        children,
        source = '',
      ) {
        return {
          type: NodeTypes.ROOT,
          source,
          children
        }
      }
      // 当前的根节点
      let currentRoot = null
      let currentInput = ''
      // 开始标签临时存储变量
      let currentOpenTag = null
      const stack = []

      class Tokenizer {
        // 当前 Tokenizer 的状态。默认是文本状态（State.Text）。在解析过程中，状态可能会根据遇到的模板内容（如标签、注释、表达式等）而改变。
        state = State.Text
        // 读取缓冲区。用于存储从输入字符串中读取但尚未解析的字符。
        buffer = ''
        // 当前状态的初始字符位置
        sectionStart = 0
        // 在缓冲区中当前正在查看的索引位置。
        index = 0
        // 插值左分隔符
        delimiterOpen = [123, 123] // { 字符的 Unicode 编码
        // 插值右分隔符
        delimiterClose = [125, 125] // } 字符的 Unicode 编码
        // 跟踪当前正在处理或最近找到的分隔符的位置
        delimiterIndex = 0
        constructor(cbs) {
          // 初始化的时候注册回调钩子函数
          this.cbs = cbs
        }
        // 文本状态处理方法
        stateText(c) {
          // 判断是否是 < 
          if (c === CharCodes.Lt) {
            if (this.index > this.sectionStart) {
              this.cbs.ontext(this.sectionStart, this.index)
            }
            // 更改状态为标签名前状态
            this.state = State.BeforeTagName
            // 设置当前状态的初始字符位置
            this.sectionStart = this.index
          } else if (c === this.delimiterOpen[0]) { // 判断是否是插值开始状态
            // 进入插值开始状态
            this.state = State.InterpolationOpen
            this.delimiterIndex++
          }
        }
        // 插值开始状态处理方法
        stateInterpolationOpen(c) {
          // 检查当前字符是否与 delimiterOpen 中对应的字符匹配
          if (c === this.delimiterOpen[this.delimiterIndex]) {
            // 已经匹配了 delimiterOpen 中的所有字符
            if (this.delimiterIndex === this.delimiterOpen.length - 1) {
              // 计算插值表达式的起始位置
              const start = this.index + 1 - this.delimiterOpen.length
              if (start > this.sectionStart) {
                this.cbs.ontext(this.sectionStart, start)
              } 
              // 进入插值状态
              this.state = State.Interpolation
              // 设置插值表达式的起始位置
              this.sectionStart = start
            } else {
              // 继续增加 delimiterIndex 以匹配更多的字符
              this.delimiterIndex++
            }
          }
        }
        // 插值结束状态处理方法
        stateInterpolationClose(c) {
          // 检查当前字符是否与 delimiterClose 的后续字符匹配
          if (c === this.delimiterClose[this.delimiterIndex]) {
            // 判断是否匹配了所有的插值关闭字符
            if (this.delimiterIndex === this.delimiterClose.length - 1) {
              // 如果匹配并且已经匹配了 delimiterClose 的所有字符，则调用 oninterpolation 方法处理插值表达式
              this.cbs.oninterpolation(this.sectionStart, this.index + 1)
              // 重置状态为文本状态（Text）
              this.state = State.Text
              // 设置当前状态的初始字符位置
              this.sectionStart = this.index + 1
            } else {
              // 如果还没匹配完则继续增加 delimiterIndex 值，以便匹配完所有的插值关闭字符
              this.delimiterIndex++
            }
          }
        }
        // 插值状态处理方法
        stateInterpolation(c) {
          // 如果当前字符是否与 delimiterClose 的第一个字符匹配
          if (c === this.delimiterClose[0]) {
            // 如果匹配则进入插值结束状态
            this.state = State.InterpolationClose
            // 重置分隔符索引为 1
            this.delimiterIndex = 1
          }
        }
        // 标签名前状态
        stateBeforeTagName(c) {
          // 判断是否标签名
          if (isTagStartChar(c)) {
            // 设置当前状态的初始字符位置
            this.sectionStart = this.index
            // 更新状态为标签名状态
            this.state = State.InTagName
          } else if (c === CharCodes.Slash) { // '/'表示是闭合标签
            // 更新状态为结束标签名前状态 
            this.state = State.BeforeClosingTagName
          }
        }
        // 标签名状态
        stateInTagName(c) {
          // 判断是否结束标签名状态
          if (isEndOfTagSection(c)) {
            this.handleTagName(c)
          }
        }
        // 处理标签名结束时的逻辑
        handleTagName(c) {
          // 触发标签名处理事件回调函数，输出标签名的 AST 数据节点
          this.cbs.onopentagname(this.sectionStart, this.index)
          // 重置当前状态的初始字符位置
          this.sectionStart = -1
          // 更改状态为属性名前状态
          this.state = State.BeforeAttrName
          // 将根据当前状态（即属性名称之前的状态）和传入的参数来继续解析
          this.stateBeforeAttrName(c)
        }
        // 属性名前状态
        stateBeforeAttrName(c) {
          // 如果当前字符是 >
          if (c === CharCodes.Gt) {
            // 触发回调事件处理标签名
            this.cbs.onopentagend()
            // 切换到初始状态文本状态
            this.state = State.Text
            // 设置当前状态的初始字符位置
            this.sectionStart = this.index + 1
          }
        }
        // 结束标签名前状态
        stateBeforeClosingTagName(c) {
          // 判断是否标签名
          if (isTagStartChar(c)) {
            // 切换到结束标签名状态
            this.state = State.InClosingTagName
            // 设置当前状态的初始字符位置
            this.sectionStart = this.index
          }
        }
        // 结束标签名状态
        stateInClosingTagName(c) {
          // 判断当前字符是 > 还是空白
          if (c === CharCodes.Gt || isWhitespace(c)) {
            // 执行结束标签回调事件处理函数
            this.cbs.onclosetag(this.sectionStart, this.index)
            this.sectionStart = -1
            // 切换到结束标签名后状态
            this.state = State.AfterClosingTagName
            // 在结束标签名后状态中继续消费当前字符
            this.stateAfterClosingTagName(c)
          }          
        }
        // 结束标签名后状态
        stateAfterClosingTagName(c) {
          // 如果当前字符是 >
          if (c === CharCodes.Gt) {
            // 恢复初始状态
            this.state = State.Text
            // 设置当前状态的初始字符位置
            this.sectionStart = this.index + 1
          }
        }

        parse(input) {
          this.buffer = input
          // 使用 while 循环遍历 buffer 中的每个字符，直到达到字符串的末尾
          while (this.index < this.buffer.length) {
            // 使用 charCodeAt 方法获取当前索引 index 处的字符的 Unicode 编码
            const c = this.buffer.charCodeAt(this.index)
            // 根据当前状态 state 使用 switch 语句进行不同的处理
            switch (this.state) {
              // 文本状态
              case State.Text: {
                this.stateText(c)
                break
              }
              // 插值开始状态
              case State.InterpolationOpen: {
                this.stateInterpolationOpen(c)
                break
              }
              // 插值状态
              case State.Interpolation: {
                this.stateInterpolation(c)
                break
              }
              // 插值结束状态
              case State.InterpolationClose: {
                this.stateInterpolationClose(c)
                break
              }
              // 标签名前状态
              case State.BeforeTagName: {
                this.stateBeforeTagName(c)
                break
              }
              // 标签名状态
              case State.InTagName: {
                this.stateInTagName(c)
                break
              }
              // 结束标签名前状态
              case State.BeforeClosingTagName: {
                this.stateBeforeClosingTagName(c)
                break
              }
              // 结束标签名状态
              case State.InClosingTagName: {
                this.stateInClosingTagName(c)
                break
              }
            }
            // 在每次循环结束时，无论状态是否改变，都将 index 增加 1，以移动到字符串中的下一个字符
            this.index++
          }
        }
      }

      // 创建一个表示简单表达式的对象
      function createExp(content) {
        return {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content,
        }
      }
      
        /**
         * HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a
         * tag name.
         */
        function isTagStartChar(c) {
          return (
            (c >= CharCodes.LowerA && c <= CharCodes.LowerZ) ||
            (c >= CharCodes.UpperA && c <= CharCodes.UpperZ)
          )
        }
        // 是否空白
        function isWhitespace(c) {
          return (
            c === CharCodes.Space || // 空白
            c === CharCodes.NewLine || // "\n" 换行 
            c === CharCodes.Tab || // "\t" tab 键空白 
            c === CharCodes.FormFeed || // "\f" 换页符
            c === CharCodes.CarriageReturn // "\r" 回车符
          )
        }

        function isEndOfTagSection(c) {
          return c === CharCodes.Slash || c === CharCodes.Gt || isWhitespace(c)
        }
        // 添加 AST 节点
        function addNode(node) {
          // 判断 stack 数组的第一个元素是否存在，如果存在，就将新节点添加到这个元素的children数组中；如果不存在，就将新节点添加到currentRoot的children数组中
          ;(stack[0] || currentRoot).children.push(node)
        }

      const tokenizer = new Tokenizer({
        ontext(start, end) {
          onText(getSlice(start, end))
        },
        // 处理插值
        oninterpolation(start, end) {
          // 计算插值内容的起始索引，innerStart 是插值左分隔符之后的第一个字符的索引
          let innerStart = start + tokenizer.delimiterOpen.length
          // 计算插值内容的结束索引，innerEnd 是插值右分隔符之前的最后一个字符的索引
          let innerEnd = end - tokenizer.delimiterClose.length
          // 提取插值内容
          const content = tokenizer.buffer.slice(innerStart, innerEnd)
          // 创建表达式对象，调用 createExp 方法，将提取的内容作为参数，以创建一个表示简单表达式的对象
          const exp = createExp(content)
          // 创建 AST 节点：创建一个新的 AST 节点对象，其 type 属性为 NodeTypes.INTERPOLATION（表示插值），content 属性为上面创建的简单表达式对象
          const node = {
            type: NodeTypes.INTERPOLATION,
            content: exp,
          }
          // 将新创建的插值节点添加到 currentRoot.children 数组中
          //   currentRoot.children.push(node)
          addNode(node)
        },
        onopentagname(start, end) {
          // 获取标签名称，start 和 end 这两个参数表示标签名称在 Tokenizer 的缓冲区中的起始和结束位置
          const name = tokenizer.buffer.slice(start, end)
          // 开始标签先存储到一个临时变量中
          currentOpenTag = {
            type: NodeTypes.ELEMENT,
            tag: name, // 标签名
            tagType: ElementTypes.ELEMENT, // 标签的类型
            props: [], // 存储属性
            children: [] // 存储子元素
          }
        },
        // 处理标签名
        onopentagend() {
          // 将当前标签（currentOpenTag）添加到当前 AST 节点数据中
          addNode(currentOpenTag)
          // 将当前标签添加到stack数组的开始位置，stack数组用于存储当前标签的父标签，以便在后续需要时能够正确地嵌套标签。
          stack.unshift(currentOpenTag)
          // 重置
          currentOpenTag = null
        },
        // 处理关闭标签函数
        onclosetag(start, end) {
          // 获取关闭标签的名称
          const name = getSlice(start, end)
          // 是否找到和当前关闭标签一样的标签
          let found = false
          // 遍历 stack
          for (let i = 0; i < stack.length; i++) {
            const e = stack[i]
            // 查找与当前关闭标签相匹配的标签
            if (e.tag.toLowerCase() === name.toLowerCase()) {
              // 如果找到匹配的标签，设置found为true
              found = true
              if (i > 0) {
                // 如果找到匹配的标签，并且这个标签不是栈中的第一个标签（意味着在它之前还有其他未闭合的标签），则发出一个错误，表示缺少结束标签
                throw new Error(`缺少结束标签:${name}`)
              }
              for (let j = 0; j <= i; j++) {
                // 从栈中移除所有直到（包括）当前匹配的标签
                const el = stack.shift()
              }
              break              
            }
          }
          // 如果在栈中没有找到匹配的标签，则发出一个错误，表示无效的结束标签
          if (!found) {
            throw new Error(`无效标签:${name}`)
          }
        }
      })
      // 根据索引截取字符
      function getSlice(start, end) {
        return currentInput.slice(start, end)
      }

      // 添加文本 AST 节点数据
      function onText(content) {
        const parent = stack[0] || currentRoot
        parent.children.push({
          type: NodeTypes.TEXT,
          content
        })
      }

      // 启动解析器函数
      export function baseParse(input){
        currentInput = input
        // 创建 AST 根节点
        currentRoot = createRoot([], input)
        tokenizer.parse(input)
        return currentRoot
      }