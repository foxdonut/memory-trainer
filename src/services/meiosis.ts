import m, { FactoryComponent } from 'mithril';
import Stream from 'mithril/stream';
import { App, Service, setup } from 'meiosis-setup/mergerino';
import { appStateMgmt, createActions, IAppStateActions, IAppStateModel } from './states';

export interface IAppModel extends IAppStateModel {}

export interface IActions extends IAppStateActions {}

export type MeiosisComponent<T extends { [key: string]: any } = {}> = FactoryComponent<{
  state: IAppModel;
  actions: IActions;
  options?: T;
}>;

const app: App<IAppModel> = {
  initial: Object.assign({}, appStateMgmt.initial) as IAppModel,
  /** Services update the state */
  services: [
    // (s) => console.log(s.app.page),
  ] as Array<Service<IAppModel>>,
  // effects: (_update: UpdateStream, actions: IActions) => [
  //   LoginEffect(actions),
  //   LoadDataEffect(actions),
  // ],
};


const { states, getCell } = setup({ stream: Stream, app });

const actions: IActions =
  createActions({ getState: states, update: getCell().update });

export const getMeiosisCell = () => ({
  ...getCell(),
  actions
});

states.map(() => {
  m.redraw();
});
