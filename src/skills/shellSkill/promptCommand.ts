import { Recognizer } from '../recognizer';
import { SkillCommand, SkillCommandOptionType } from '../skillCommand';

export class PromptCommand extends SkillCommand {
    constructor(dialogId: string, recognizer?: Recognizer) {
        super(dialogId, 'prompt');
        this.recognizer = recognizer;

        // Add options and processing step
        this.addOption({ 
            name: 'variable', 
            type: SkillCommandOptionType.string,
            defaultOption: true
        });
        this.addOption({ 
            name: 'type',
            alias: 't', 
            type: SkillCommandOptionType.string
        });
        this.addOption({ 
            name: 'prompt',
            alias: 'p', 
            type: SkillCommandOptionType.string
        });
        this.addOption({ 
            name: 'retry-prompt',
            alias: 'r', 
            type: SkillCommandOptionType.string
        });
        this.addOption({ 
            name: 'choices',
            alias: 'c', 
            type: SkillCommandOptionType.string,
            multiple: true
        });
        this.addProcessingStep(
            async (step) => {
                // Ensure variable specified
                if (!step.options['variable']) {
                    await step.context.sendActivity(`error: variable not passed to prompt.`);
                    return await step.endDialog();
                }

                // Ensure choices specified
                const type = step.options['type'] || 'string';
                if (type === 'choice' && !Array.isArray(step.options['choices'])) {
                    await step.context.sendActivity(`error: choices not passed to choice prompt.`);
                    return await step.endDialog();
                }

                // Initiate prompt
                // - This is leveraging the fact that SkillCommand has already added a basic set of
                //   prompts to the commands dialog.
                const prompt = step.options['prompt'] || `Enter the ${step.options['variable']} value.`;
                return await step.prompt(type, {
                    prompt: prompt,
                    retryPrompt: step.options['retry-prompt'],
                    choices: step.options['choices']
                });
            },
            async (step) => {
                const variable = step.options['variable'];
                if (step.options['type'] === 'choice') {
                    process.env[variable] = step.result.value;
                } else {
                    process.env[variable] = step.result.toString();
                }
                return await step.endDialog();
            }
        );
    }
}
