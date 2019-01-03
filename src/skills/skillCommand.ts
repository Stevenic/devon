import { TurnContext, RecognizerResult, Activity } from 'botbuilder';
import { WaterfallDialog, WaterfallStep, TextPrompt, NumberPrompt, ConfirmPrompt, ChoicePrompt, Choice, PromptOptions } from 'botbuilder-dialogs';
import { CustomSkillCommand, RecognizedCommand } from './customSkillCommand';
import { NONE_INTENT, topIntent } from './recognizer';
import { ExistingPathPrompt } from './existingPathPrompt';
import { PathPrompt } from './pathPrompt';
import commandLineArgs = require('command-line-args');

export enum SkillCommandOptionType {
    string = 'string',
    number = 'number',
    boolean = 'boolean',
    choice = 'choice',
    path = 'path',
    existing_path = 'existing_path'
}

export interface SkillCommandOption {
    /**
     * The long option name.
     */
    name: string;

    /**
     * The options type. Defaults to a 'string'.
     */
    type?: SkillCommandOptionType;

    /**
     * A getopt-style short option name. Can be any single character except a digit or hyphen.
     */
    alias?: string;

    /**
     * Set this flag if the option accepts multiple values. In the output, you will receive an array of values each passed through the `type` function.
     */
    multiple?: boolean;

    /**
     * Identical to `multiple` but with greedy parsing disabled.
     */
    lazyMultiple?: boolean;

    /**
     * Any values unaccounted for by an option definition will be set on the `defaultOption`. This flag is typically set
     * on the most commonly-used option to enable more concise usage.
     */
    defaultOption?: boolean;

    /**
     * An initial value for the option.
     */
    defaultValue?: any;

    /**
     * One or more group names the option belongs to.
     */
    group?: string | string[];

    /**
     * If `true` the option is required and the user will be prompted for the option if missing. 
     * Defaults to a value of `false`.
     */
    required?: boolean;

    /**
     * List of choices to present the user with.
     */
    choices?: (string|Choice)[];

    /**
     * Prompt to show the user if a required option is missing. By default a prompt based on the 
     * options `name` will be generated. 
     */
    prompt?: string|Partial<Activity>;

    /**
     * Prompt to show the user if the user  required option is missing. By default a prompt based on the 
     * options `name` will be generated. 
     */
    retryPrompt?: string|Partial<Activity>;
}

export class SkillCommand extends CustomSkillCommand {
    private readonly sequence = new WaterfallDialog('sequence');
    private readonly options: commandLineArgs.OptionDefinition[] = [];
    
    public commandNames: string[];

    constructor(dialogId: string, ...commandNames: string[]) {
        super(dialogId);
        this.commandNames = commandNames;

        // Add main sequence dialog
        this.addDialog(this.sequence);

        // Add support prompts
        const booleanPrompt = new ConfirmPrompt(SkillCommandOptionType.boolean);
        booleanPrompt.confirmChoices = ['true', 'false'];
        this.addDialog(booleanPrompt);
        this.addDialog(new TextPrompt(SkillCommandOptionType.string));
        this.addDialog(new NumberPrompt(SkillCommandOptionType.number));
        this.addDialog(new ChoicePrompt(SkillCommandOptionType.choice));
        this.addDialog(new PathPrompt(SkillCommandOptionType.path));
        this.addDialog(new ExistingPathPrompt(SkillCommandOptionType.existing_path));
    }

    public addOption(...options: SkillCommandOption[]): this {
        options.forEach((opt) => {
            switch (opt.type || SkillCommandOptionType.string) {
                case SkillCommandOptionType.string:
                case SkillCommandOptionType.path:
                case SkillCommandOptionType.existing_path:
                    this.addOptionStep(opt, String);
                    break;
                case SkillCommandOptionType.number:
                    this.addOptionStep(opt, Number);
                    break;
                case SkillCommandOptionType.boolean:
                    this.addOptionStep(opt, Boolean);
                    break;
                case SkillCommandOptionType.choice:
                    if (!opt.choices || opt.choices.length == 0) { throw new Error(`ConfiguredSkillCommand.addOption(): must specify a list of choices for 'choice' options.`) }
                    this.addOptionStep(opt, String);
                    break;
                }
        });
        return this;
    }

    public addProcessingStep(...steps: WaterfallStep[]): this {
        steps.forEach((step) => this.sequence.addStep(step));
        return this;
    }

    protected async onRecognizeCommand(context: TurnContext, recognized: RecognizerResult): Promise<RecognizedCommand|undefined> {
        const top = topIntent(recognized);
        if (this.intentName && top.name === this.intentName) {
            // Map entities to options and return recognized command
            const options = await this.onMapEntitiesToOptions(context, recognized);
            return {
                score: top.score,
                dialogId: this.id,
                dialogOptions: options
            };
        } else if (top.name === NONE_INTENT) {
            // Attempt to recognize a command in utterance
            let argv = CustomSkillCommand.utteranceToArgv(context);
            const mainOptions = commandLineArgs([{ name: 'command', defaultOption: true }], { argv: argv, stopAtFirstUnknown: true });
            argv = mainOptions._unknown || [];
            for (let i = 0; i < this.commandNames.length; i++) {
                if ((mainOptions.command as string).toLowerCase() === this.commandNames[i].toLowerCase()) {
                    const options = await this.onMapArgvToOptions(context, argv);
                    return {
                        score: 1.0,
                        dialogId: this.id,
                        dialogOptions: options
                    };
                }
            }
            return undefined;
        }
    }

    protected async onMapEntitiesToOptions(context: TurnContext, recognized: RecognizerResult): Promise<object> {
        const options = {};
        
        return options;
    }

    protected async onMapArgvToOptions(context: TurnContext, argv: string[]): Promise<object> {
        if (this.options.length > 0) {
            return commandLineArgs(this.options, { argv: argv });
        }
        return {};
    }

    private addOptionStep(option: SkillCommandOption, type: (input: string) => any): void {
        this.options.push(Object.assign({}, option, { type: type }) as commandLineArgs.OptionDefinition);
        if (option.required) {
            // Add sequence steps to ensure a required option is set.
            this.sequence
                .addStep(async (step) => {
                    // TODO: add logic to validate pre-populated option values
                    if (!step.options.hasOwnProperty(option.name)) {
                        // Prompt user for required option.
                        return await step.prompt(option.type, this.formatPromptOptions(option));
                    } else {
                        // Fall through this and the next step.
                        return await step.next();
                    }
                })
                .addStep(async (step) => {
                    // Save value to options or fall through.
                    if (step.result !== undefined) {
                        if (option.multiple || option.lazyMultiple) {
                            step.options[option.name] = [step.result];
                        } else {
                            step.options[option.name] = step.result;
                        }
                    }
                    return await step.next();
                });
        }
    }

    private formatPromptOptions(option: SkillCommandOption): PromptOptions {
        const type = option.type || SkillCommandOptionType.string; 
        const opt: PromptOptions = { prompt: option.prompt, retryPrompt: option.retryPrompt, choices: option.choices };
        if (!opt.prompt) {
            switch (type) {
                case SkillCommandOptionType.string:
                case SkillCommandOptionType.number:
                case SkillCommandOptionType.boolean:
                    opt.prompt = `Enter a value for the '${option.name}' option.`;
                    break;
                case SkillCommandOptionType.choice:
                    opt.prompt = `Chose a value for the '${option.name}' option from this list of choices:`;
                    break;
                case SkillCommandOptionType.path:
                    opt.prompt = `Enter a filesystem path for the '${option.name}' option.`;
                    break;
                case SkillCommandOptionType.existing_path:
                    opt.prompt = `Enter an existing filesystem path for the '${option.name}' option.`;
                    break;
            }
        }
        if (!opt.retryPrompt) {
            switch (type) {
                case SkillCommandOptionType.string:
                    opt.retryPrompt = `The '${option.name}' option is required so please enter a value.`;
                    break;
                case SkillCommandOptionType.number:
                    opt.retryPrompt = `The input was either missing or invalid. Please enter a valid number.`;
                    break;
                case SkillCommandOptionType.boolean:
                    opt.retryPrompt = `The input was either missing or invalid. Please enter either 'true' or 'false'.`;
                    break;
                case SkillCommandOptionType.choice:
                    opt.retryPrompt = `The input was either missing or invalid. Please select a choice from the list.`;
                    break;
                case SkillCommandOptionType.path:
                    opt.retryPrompt = `The input doesn't appear to be a valid path. Please enter an absolute path or a path that's relative to the current directory.`;
                    break;
                case SkillCommandOptionType.existing_path:
                    opt.retryPrompt = `The input path can't be found. Please enter an existing absolute path or an existing path that's relative to the current directory.`;
                    break;
            }
        }
        return opt;
    }
}
