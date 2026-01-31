export const isRemoteToRemote = (
  sourcePanelType: 'local' | 'remote',
  destPanelType: 'local' | 'remote'
): boolean => {
  return sourcePanelType === 'remote' && destPanelType === 'remote'
}

export const getTransferType = (
  sourcePanelType: 'local' | 'remote',
  destPanelType: 'local' | 'remote'
): 'upload' | 'download' | 'remote-to-remote' => {
  if (sourcePanelType === 'local' && destPanelType === 'remote') {
    return 'upload'
  }
  if (sourcePanelType === 'remote' && destPanelType === 'local') {
    return 'download'
  }
  return 'remote-to-remote'
}
