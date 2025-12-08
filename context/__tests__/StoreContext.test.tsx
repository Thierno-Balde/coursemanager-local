import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreProvider, useStore } from '../StoreContext';
import { Formation, Settings } from '../../types';

// Mocking electronAPI
const mockElectronAPI = {
  getData: jest.fn(),
  getRoot: jest.fn(),
  saveData: jest.fn(() => Promise.resolve({ success: true })),
  setRoot: jest.fn(),
  importFile: jest.fn(),
  deleteResource: jest.fn(),
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
});

// Mock crypto.randomUUID for consistent IDs in tests
const MOCK_UUIDS = [
    'mock-uuid-1', 'mock-uuid-2', 'mock-uuid-3', 'mock-uuid-4', 'mock-uuid-5'
];
let uuidIndex = 0;
Object.defineProperty(global.crypto, 'randomUUID', {
    value: () => MOCK_UUIDS[uuidIndex++ % MOCK_UUIDS.length],
    writable: true,
});

const TestComponent: React.FC = () => {
  const { formations, settings } = useStore();
  return (
    <div>
      <div data-testid="formations-count">{formations.length}</div>
      <div data-testid="settings-root">{settings.rootDirectory}</div>
    </div>
  );
};

describe('StoreContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    uuidIndex = 0;
  });

  it('provides initial state and loads data on mount', async () => {
    const mockFormations: Formation[] = [{ id: '1', titre: 'Test Formation', modules: [], description: '' }];
    const mockSettings: Settings = { rootDirectory: '/mock/root' };
    mockElectronAPI.getData.mockResolvedValue({ formations: mockFormations, settings: mockSettings });
    mockElectronAPI.getRoot.mockResolvedValue('/mock/root');

    render(
      <StoreProvider>
        <TestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('formations-count')).toHaveTextContent('1');
      expect(screen.getByTestId('settings-root')).toHaveTextContent('/mock/root');
    });

    expect(mockElectronAPI.getData).toHaveBeenCalledTimes(1);
    expect(mockElectronAPI.getRoot).toHaveBeenCalledTimes(1);
  });

  const ActionsTestComponent: React.FC = () => {
    const { formations, settings, addFormation, updateFormation, deleteFormation, addModule, updateModule, deleteModule, reorderModules, addRessource, updateRessource, deleteRessource, reorderResources, exportData, importData } = useStore();
    const formationId = formations[0]?.id || 'no-id';
    const moduleId = formations[0]?.modules[0]?.id || 'no-id';
    const resourceId = formations[0]?.modules[0]?.ressources[0]?.id || 'no-id';

    return (
      <div>
        <div data-testid="formations-json">{JSON.stringify(formations)}</div>
        <div data-testid="settings-root">{settings.rootDirectory}</div>
        <button onClick={async () => await addFormation({ id: 'mock-uuid-1', titre: 'New Course', modules: [], description: 'Desc' })}>Add Formation</button>
        <button onClick={async () => await updateFormation('mock-uuid-1', { titre: 'Updated Course' })}>Update Formation</button>
        <button onClick={async () => await deleteFormation('mock-uuid-1')}>Delete Formation</button>
        
        {formationId !== 'no-id' && (
          <>
            <button onClick={async () => await addModule(formationId, { id: 'mock-uuid-2', titre: 'New Module', ressources: [] })}>Add Module</button>
            <button onClick={async () => await updateModule(formationId, 'mock-uuid-2', { titre: 'Updated Module' })}>Update Module</button>
            <button onClick={async () => await deleteModule(formationId, 'mock-uuid-2')}>Delete Module</button>
            <button onClick={async () => await reorderModules(formationId, 0, 1)}>Reorder Modules</button>
          </>
        )}
        {formationId !== 'no-id' && moduleId !== 'no-id' && (
          <>
            <button onClick={async () => await addRessource(formationId, moduleId, { id: 'mock-uuid-4', titre: 'New Ressource', type: 'pdf', role: 'annexe' })}>Add Ressource</button>
            <button onClick={async () => await updateRessource(formationId, moduleId, 'mock-uuid-4', { titre: 'Updated Ressource' })}>Update Ressource</button>
            <button onClick={async () => await deleteRessource(formationId, moduleId, 'mock-uuid-4')}>Delete Ressource</button>
            <button onClick={async () => await reorderResources(formationId, moduleId, 0, 1)}>Reorder Resources</button>
          </>
        )}
        <button onClick={() => exportData()} data-testid="export-button">Export Data</button>
        <button onClick={() => importData(JSON.stringify({ formations: [{ id: 'mock-imported', titre: 'Imported Course', modules: [], description: '' }], settings: {rootDirectory: '/imported/root'} }))} data-testid="import-button">Import Data</button>
        <div data-testid="exported-data-value" style={{ display: 'none' }}>{exportData()}</div>
      </div>
    );
  };

  it('adds a formation', async () => {
    mockElectronAPI.getData.mockResolvedValue({ formations: [], settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => expect(screen.getByTestId('formations-json')).toHaveTextContent('[]'));

    await user.click(screen.getByText('Add Formation'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations).toHaveLength(1);
      expect(formations[0].titre).toBe('New Course');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('updates a formation', async () => {
    const initialFormations: Formation[] = [{ id: 'mock-uuid-1', titre: 'New Course', modules: [], description: 'Desc' }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].titre).toBe('New Course');
    });

    await user.click(screen.getByText('Update Formation'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].titre).toBe('Updated Course');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('deletes a formation', async () => {
    const initialFormations: Formation[] = [{ id: 'mock-uuid-1', titre: 'New Course', modules: [], description: 'Desc' }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => expect(screen.getByTestId('formations-json')).toHaveTextContent(JSON.stringify(initialFormations)));

    await user.click(screen.getByText('Delete Formation'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations).toHaveLength(0);
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('adds a module to a formation', async () => {
    const initialFormations: Formation[] = [{ id: 'mock-uuid-1', titre: 'Test Course', modules: [], description: '' }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules).toHaveLength(0);
    });

    await user.click(screen.getByText('Add Module'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules).toHaveLength(1);
      expect(formations[0].modules[0].titre).toBe('New Module');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('updates a module in a formation', async () => {
    const initialFormations: Formation[] = [{ id: 'mock-uuid-1', titre: 'Test Course', modules: [{ id: 'mock-uuid-2', titre: 'Old Module', ressources: [] }], description: '' }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].titre).toBe('Old Module');
    });

    await user.click(screen.getByText('Update Module'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].titre).toBe('Updated Module');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('deletes a module from a formation', async () => {
    const initialFormations: Formation[] = [{ id: 'mock-uuid-1', titre: 'Test Course', modules: [{ id: 'mock-uuid-2', titre: 'Old Module', ressources: [] }], description: '' }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules).toHaveLength(1);
    });

    await user.click(screen.getByText('Delete Module'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules).toHaveLength(0);
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('reorders modules within a formation', async () => {
    const initialFormations: Formation[] = [{
      id: 'mock-uuid-1',
      titre: 'Test Course',
      modules: [
        { id: 'mock-uuid-2', titre: 'Module A', ressources: [] },
        { id: 'mock-uuid-3', titre: 'Module B', ressources: [] },
      ],
      description: ''
    }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].titre).toBe('Module A');
      expect(formations[0].modules[1].titre).toBe('Module B');
    });

    await user.click(screen.getByText('Reorder Modules')); // Reorder 0 to 1

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].titre).toBe('Module B');
      expect(formations[0].modules[1].titre).toBe('Module A');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('adds a resource to a module', async () => {
    const initialFormations: Formation[] = [{
      id: 'mock-uuid-1',
      titre: 'Test Course',
      modules: [
        { id: 'mock-uuid-2', titre: 'Test Module', ressources: [] },
      ],
      description: ''
    }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].ressources).toHaveLength(0);
    });

    await user.click(screen.getByText('Add Ressource'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].ressources).toHaveLength(1);
      expect(formations[0].modules[0].ressources[0].titre).toBe('New Ressource');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('updates a resource in a module', async () => {
    const initialFormations: Formation[] = [{
      id: 'mock-uuid-1',
      titre: 'Test Course',
      modules: [
        { id: 'mock-uuid-2', titre: 'Test Module', ressources: [{ id: 'mock-uuid-4', titre: 'Old Ressource', type: 'pdf', role: 'annexe' }] },
      ],
      description: ''
    }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].ressources[0].titre).toBe('Old Ressource');
    });

    await user.click(screen.getByText('Update Ressource'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].ressources[0].titre).toBe('Updated Ressource');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('deletes a resource from a module', async () => {
    const initialFormations: Formation[] = [{
      id: 'mock-uuid-1',
      titre: 'Test Course',
      modules: [
        { id: 'mock-uuid-2', titre: 'Test Module', ressources: [{ id: 'mock-uuid-4', titre: 'Old Ressource', type: 'pdf', role: 'annexe' }] },
      ],
      description: ''
    }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].ressources).toHaveLength(1);
    });

    await user.click(screen.getByText('Delete Ressource'));

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].ressources).toHaveLength(0);
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });

  it('reorders resources within a module', async () => {
    const initialFormations: Formation[] = [{
      id: 'mock-uuid-1',
      titre: 'Test Course',
      modules: [
        {
          id: 'mock-uuid-2',
          titre: 'Test Module',
          ressources: [
            { id: 'mock-uuid-4', titre: 'Ressource A', type: 'pdf', role: 'annexe' },
            { id: 'mock-uuid-5', titre: 'Ressource B', type: 'pdf', role: 'annexe' },
          ]
        },
      ],
      description: ''
    }];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].ressources[0].titre).toBe('Ressource A');
      expect(formations[0].modules[0].ressources[1].titre).toBe('Ressource B');
    });

    await user.click(screen.getByText('Reorder Resources')); // Reorder 0 to 1

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations[0].modules[0].ressources[0].titre).toBe('Ressource B');
      expect(formations[0].modules[0].ressources[1].titre).toBe('Ressource A');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1);
    });
  });
  
  it('exports data correctly', async () => {
    const initialFormations: Formation[] = [{ id: 'mock-uuid-1', titre: 'Export Test', modules: [], description: '' }];
    const initialSettings: Settings = { rootDirectory: '/test/export' };
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: initialSettings });
    mockElectronAPI.getRoot.mockResolvedValue('/test/export');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('formations-json')).toHaveTextContent(JSON.stringify(initialFormations));
      expect(screen.getByTestId('settings-root')).toHaveTextContent('/test/export');
    });

    await waitFor(() => {
        const expectedExportedData = JSON.stringify({
            formations: initialFormations,
            settings: initialSettings,
        }, null, 2);
        const receivedExportedData = screen.getByTestId('exported-data-value').textContent;
        expect(JSON.parse(receivedExportedData || '{}')).toEqual(JSON.parse(expectedExportedData));
    });

    const exportButton = screen.getByTestId('export-button');
    await user.click(exportButton); // Click to ensure handler doesn't throw.
  });

  it('imports data correctly', async () => {
    const initialFormations: Formation[] = [];
    mockElectronAPI.getData.mockResolvedValue({ formations: initialFormations, settings: { rootDirectory: '' } });
    mockElectronAPI.getRoot.mockResolvedValue('');

    render(
      <StoreProvider>
        <ActionsTestComponent />
      </StoreProvider>
    );

    await waitFor(() => expect(screen.getByTestId('formations-json')).toHaveTextContent('[]'));

    const importedData = JSON.stringify({
      formations: [{ id: 'mock-imported', titre: 'Imported Course', modules: [], description: '' }],
      settings: { rootDirectory: '/imported/root' }
    });

    // Mock electronAPI.saveData for the import process
    mockElectronAPI.saveData.mockClear();
    
    const importButton = screen.getByTestId('import-button');
    await user.click(importButton);

    await waitFor(() => {
      const formationsJson = screen.getByTestId('formations-json').textContent;
      const formations = JSON.parse(formationsJson || '[]');
      expect(formations).toHaveLength(1);
      expect(formations[0].titre).toBe('Imported Course');
      expect(mockElectronAPI.saveData).toHaveBeenCalledTimes(1); // One call for import
      // Verify settings are also updated
      expect(screen.getByTestId('settings-root')).toHaveTextContent('/imported/root');
    });
  });
});