const nodegit = jest.genMockFromModule('nodegit');

nodegit.Repository.init.mockImplementation(() => Promise.resolve({}));
nodegit.Repository.open.mockImplementation(() => Promise.resolve({}));
nodegit.Branch.lookup.mockImplementation(() => Promise.resolve({}));
nodegit.Branch.create.mockImplementation(() => Promise.resolve({}));

export default nodegit;
