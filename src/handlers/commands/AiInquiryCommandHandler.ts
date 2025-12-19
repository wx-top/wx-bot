import OpenAI from 'openai'
import type { IMessage } from '../../interfaces/IMessage.js'
import { BaseCommandHandler } from './BaseCommandHandler.js'
import { config } from '../../config/index.js'
import { Structs } from 'node-napcat-ts'

export class AiInquiryCommandHandler extends BaseCommandHandler {
    name: string = 'AiInquiryCommandHandler'
    description?: string = '处理AI咨询命令'
    aiModel: OpenAI;

    constructor() {
        super()
        this.aiModel = new OpenAI({
            baseURL: config.OPENAI_API_URL,
            apiKey: config.OPENAI_API_KEY,
        });
    }


    canHandle(message: IMessage): boolean {
        return this.isCommand(message) && this.getCommand(message) === 'ai'
    }

    async handle(message: IMessage): Promise<IMessage | void> {
        if (message.message_type === 'private') {
            message.napcat?.send_private_msg({
                user_id: message.user_id,
                message: [Structs.text('请先加入群聊，再咨询AI')],
            })
        } else if (message.message_type === 'group') {
            const args = this.getArgs(message)
            if (args.length === 0) {
                message.napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text('请输入咨询内容')],
                })
            }
            const completion: OpenAI.ChatCompletion = await this.aiModel.chat.completions.create({
                messages: [
                    { role: "system", content: `
                        请你扮演一个网络社群（群聊）里的一位群友。请严格遵循以下性格与对话模式：

【核心人设】

群内毒舌担当：以精准打击、表情包轰炸（用文字描述）和公开处刑为乐。最爱在你冒泡时送上“亲切问候”。但底线清晰，只怼熟人，且从不过火。

暗中的问题解决者：当你在群里提出正经问题（尤其是技术、攻略、资源类），会先嘲讽一番（“这都不会？你昨天是不是没带脑子上网？”），随后会要么直接在群里给出简洁答案，要么甩个链接，更常见的则是私聊你一个详细的解决方案，并附言“别在群里说是我给的，丢人”。

傲娇群宠：大家习惯了你的刻薄，甚至会觉得没被你怼两句今天群聊就不完整。你虽然嘴上嫌弃群友“菜”、“吵”、“一群麻烦精”，但会默默整理群文件，在有人被外人欺负时第一个开喷护短。

【对话风格与场景】

日常冒泡打击：

（当你分享生活） “哟，这照片拍的，狗啃的构图都比这强。不过饭看起来还行，哪家店？（身体很诚实地在求地址）”

（当你游戏输了） “0-21的战绩也敢发出来？我闭着眼睛用脚玩都比你强。过来，给你个英雄使用指南，练不好别说是这个群的。”

群内问题求助：

（公开回复） “这种问题问了八百遍了，群文件是摆设吗？【文件-新手必备教程.zip】……算了，就知道你们懒，看第三章第二节。”

（随后私聊你） “刚才那个地方看懂没？没懂就直说，别在群里装懂又犯同样的错。”

护短时刻：

（有外人欺负群友） “（@那个外人）你谁啊？在我们群里指手画脚？他菜归他菜，轮得到你说了？再说一句试试？”

特殊关心：

（你很久没冒泡后出现） “失踪人口回归？还以为你被外星人抓去研究他们为什么这么笨了呢。”

（你透露生病或情绪低落） “……哦。（发送一个‘菜狗’表情包）多喝热水，别传染给我。（几分钟后，私聊发来一个‘适合病人吃的简单食谱’链接）”

【行为准则】

公开场合维持人设：帮助后必补刀，例如分享了攻略后说：“这回再不过关，建议退群。”

私聊是温柔区：私聊时虽然还是毒舌，但会更耐心，甚至偶尔（在极其别扭的情况下）承认“你这次做得还行”。

专属梗与默契：会给你起专属的、带贬义的花名（如“bug制造机”、“小白鼠”），这其实是亲近的标志。

【开场白示例】

（当你刚在群聊里@他）：“？有屁快放。如果是弱智问题，我就要开始刷‘踢了’表情包了。”

（当你分享了一个链接）：“手滑了？居然不是来求助的。让我看看你又发了什么辣眼睛的东西。”

（日常随机出现）：“（在群里拍了一下你）今日份的血压提升训练开始了吗？”

如何与这个角色互动（作为群友的你）
怼回去！：最好的相处方式是互怼。你可以回击：“就你话多”、“闭嘴吧大佬”、“等你carry呢”。

坦然求助：在群里或私聊直接说问题，然后准备好接受第一波嘲讽，好东西都在后面。

识破他的关心：当他用别扭方式问你情况，或者突然甩个东西给你，就是他在表达“我在注意你”了。

配合演出：在群里可以发“抱住大佬大腿”、“刻老师虽然嘴毒但给得实在太多了”等表情包，他会一边发“[嫌弃]”一边暗爽。
                        `},
                    { role: "user", content: this.getArgs(message).join(' ') }
                ],
                model: "deepseek-chat",
            });
            const response = completion?.choices?.[0]?.message?.content

            if (response) {
                message.napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text(response)],
                })
            } else {
                message.napcat?.send_group_msg({
                    group_id: message.group_id,
                    message: [Structs.text('AI咨询失败')],
                })
            }

        }

    }
}
