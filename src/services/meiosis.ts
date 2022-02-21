import m, { FactoryComponent } from 'mithril';
import Stream from 'mithril/stream';
import { toStream } from 'meiosis-setup/common';
import { App, Service, setup } from 'meiosis-setup/mergerino';
import { merge } from '../utils/mergerino';
import { appStateMgmt, IAppStateActions, IAppStateModel } from './states';

export interface IAppModel extends IAppStateModel {}

export interface IActions extends IAppStateActions {}

export type MeiosisComponent<T extends { [key: string]: any } = {}> = FactoryComponent<{
  state: IAppModel;
  actions: IActions;
  options?: T;
}>;

const app: App<IAppModel, IActions> = {
  initial: Object.assign({}, appStateMgmt.initial) as IAppModel,
  Actions: context =>
    Object.assign({}, appStateMgmt.actions(context)) as IActions,
  /** Services update the state */
  services: [
    // (s) => console.log(s.app.page),
  ] as Array<Service<IAppModel>>,
  // effects: (_update: UpdateStream, actions: IActions) => [
  //   LoginEffect(actions),
  //   LoadDataEffect(actions),
  // ],
};

export const { states, getCell } = setup({ stream: toStream(Stream), merge, app });

states.map(() => {
  m.redraw();
});
