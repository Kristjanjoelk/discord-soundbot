import { ClientUser, Collection, Message } from 'discord.js';

import ICommand from './commands/base/ICommand';
import IUserCommand from './commands/base/IUserCommand';
import SoundCommand from './commands/SoundCommand';

export default class CommandCollection extends Collection<string, ICommand> {
  private readonly commands: Array<ICommand>;
  private readonly soundCommand: SoundCommand;

  constructor(commands: Array<ICommand>) {
    super();
    this.commands = commands;
    this.soundCommand = commands.find(command => !command.TRIGGERS.length)! as SoundCommand;
    this.registerCommands(commands);
  }

  public registerUserCommands(user: ClientUser) {
    const userCommands = this.commands.filter(command => (command as IUserCommand).setClientUser);
    (userCommands as Array<IUserCommand>).forEach(command => command.setClientUser(user));
    this.registerCommands(userCommands);
  }

  public execute(command: string, params: Array<string>, message: Message) {
    if (this.has(command)) {
      message.content = message.content.substring(command.length + 1);
      this.get(command)!.run(message, params);
      return;
    }

    this.soundCommand.run(message, params);
  }

  private registerCommands(commands: Array<ICommand>) {
    commands.forEach(command => this.registerTriggers(command));
  }

  private registerTriggers(command: ICommand) {
    command.TRIGGERS.forEach(trigger => this.set(trigger, command));
  }
}
