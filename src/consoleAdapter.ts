import { BotAdapter, TurnContext, Activity, ResourceResponse, ActivityTypes, ConversationReference, ChannelAccount, ConversationAccount } from 'botbuilder';
import * as readline from 'readline';
import * as uuid from 'uuid';
import chalk from 'chalk';

const CHANNEL_ID = 'console';
const USER_ACCOUNT = { id: 'user', name: 'User', role: 'user' } as ChannelAccount;
const BOT_ACCOUNT = { id: 'bot', name: 'Bot', role: 'user' } as ChannelAccount;
const MAX_TYPING_FRAMES = 5;

export class ConsoleAdapter extends BotAdapter {
    private rl: readline.Interface;
    private hTyping: NodeJS.Timeout;

    public listen(logic: (revocableContext: TurnContext) => Promise<void>, initialMsg?: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            let err: Error;
            const conversationId = uuid.v1(); 
            const that = this;
            function receiveInput(input: string): void {
                const activity: Partial<Activity> = {
                    type: ActivityTypes.Message,
                    id: uuid.v1(),
                    channelId: CHANNEL_ID,
                    from: USER_ACCOUNT,
                    recipient: BOT_ACCOUNT,
                    conversation: { id: conversationId, isGroup: false } as ConversationAccount,
                    text: input
                };
        
                that.rl.pause();
                that.receiveActivity(activity, logic)
                    .then(() => that.rl.resume())
                    .catch((e) => {
                        err = e; 
                        that.rl.close();
                    });
            }

            this.rl.on('line', receiveInput);
    
            this.rl.on('close', () => {
                this.endTyping();
                this.rl = undefined;
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });

            if (typeof initialMsg === 'string') {
                receiveInput(initialMsg);
            }
        });
    }

    public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
        const responses: ResourceResponse[] = [];
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            responses.push({} as ResourceResponse);
            switch (activity.type) {
                case ActivityTypes.Message:
                    this.endTyping();
                    console.log(activity.text);
                    break;
                case ActivityTypes.Typing:
                    this.beginTyping();
                    break;
                case 'delay':
                    await this.delay(activity.value);
            }
        }
        return responses;
    }

    public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
        throw new Error(`not implemented`);
    }

    public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
        throw new Error(`not implemented`);
    }

    public async continueConversation(reference: Partial<ConversationReference>, logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> {
        if (!this.rl) { throw new Error(`ConsoleAdapter.listen() has not been called.`) }
        const activity: Partial<Activity> = TurnContext.applyConversationReference(
            { type: ActivityTypes.Event, id: uuid.v1(), name: 'continueConversation' },
            reference,
            true
        );
        await this.receiveActivity(activity, logic);
    }

    private async receiveActivity(activity: Partial<Activity>, logic: (revocableContext: TurnContext) => Promise<void>): Promise<void> {
        const context = new TurnContext(this, activity);
        await this.runMiddleware(context, logic);
    }

    private async delay(ms: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => resolve(), ms);
        });
    }

    private beginTyping(): void {
        if (this.rl && !this.hTyping) {
            process.stdout.write('\u001b[?25l');
            let frame = 0;
            this.hTyping = setInterval(() => {
                let output = '';
                for (let i = 0; i < MAX_TYPING_FRAMES; i++) {
                    if (i == frame) {
                        output += ' .';
                    } else {
                        output += '  ';
                    }
                }
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(chalk.blue(output));
                frame++;
                if (frame >= MAX_TYPING_FRAMES) { frame = 0 }
            }, 333);
        }
    }

    private endTyping(): void {
        if (this.hTyping) {
            clearInterval(this.hTyping);
            this.hTyping = undefined;
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            process.stdout.write('\u001b[?25h');
        }
    }
}