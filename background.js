chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "new_tab":
      cmdNewTab();
      break;
    case "toggle_group":
      cmdToggleGroup();
      break;
    case "popup_window":
      cmdPopupWindow();
      break;
    case "copy_content":
      cmdCopyContent();
      break;
  }
});

async function cmdNewTab() {
  const window = await chrome.windows.getCurrent();
  const windowId = window.id;

  const [activeTab] = await chrome.tabs.query({ active: true, windowId });
  if (activeTab) {
    const newTab =await chrome.tabs.create({
      index: activeTab.index,
      windowId,
    });
    if (activeTab.groupId != chrome.tabGroups.TAB_GROUP_ID_NONE) {
      await chrome.tabs.group({
        tabIds: [newTab.id],
        groupId: activeTab.groupId,
      });
    }
  } else {
    await chrome.tabs.create({ windowId, index: 0 });
  }
}

async function getTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    return tab;
  } catch (e) {
    return null;
  }
}

async function cmdToggleGroup() {
  const window = await chrome.windows.getCurrent();
  const windowId = window.id;
  const groups = await chrome.tabGroups.query({ windowId });
  if (groups.length === 0) return;
  const group = groups[0];

  const [activeTab] = await chrome.tabs.query({ active: true, windowId });
  if (!activeTab) return;

  let group_collapsed = group.collapsed ? false : true;
  await chrome.tabGroups.update(group.id, { collapsed: group_collapsed });
  const { lastActiveTab = {} } =
    await chrome.storage.session.get("lastActiveTab");

  if (group_collapsed) {
    const tab = await getTab(lastActiveTab[chrome.tabGroups.TAB_GROUP_ID_NONE]);
    if (tab) {
      await chrome.tabs.update(tab.id, { active: true });
    } else {
      const ungroupedTabs = await chrome.tabs.query({
        groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
        windowId,
      });
      if (ungroupedTabs.length > 0) {
        await chrome.tabs.update(ungroupedTabs[0].id, { active: true });
      }
    }
  } else {
    const tab = await getTab(lastActiveTab[group.id]);
    if (tab) {
      await chrome.tabs.update(tab.id, { active: true });
    } else {
      const groupTabs = await chrome.tabs.query({
        groupId: group.id,
        windowId,
      });
      if (groupTabs.length > 0) {
        await chrome.tabs.update(groupTabs[0].id, { active: true });
      }
    }
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  const tab = await chrome.tabs.get(tabId);
  const { lastActiveTab = {} } =
    await chrome.storage.session.get("lastActiveTab");
  lastActiveTab[tab.groupId] = tabId;
  await chrome.storage.session.set({ lastActiveTab });
});

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab;
}

async function cmdPopupWindow() {
  const tab = await getCurrentTab();
  if (!tab) return;
  chrome.windows.create({
    tabId: tab.id,
    type: "popup",
    focused: true,
  });
}

async function cmdCopyContent() {
  const tab = await getCurrentTab();
  if (!tab) return;

  await chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: copyTabContent,
    },
    (_) => {
      let e = chrome.runtime.lastError;
      if (e !== undefined) {
        console.log(tab.id, _, e);
      }
    },
  );
}

function copyTabContent() {
  function extractDocument(doc) {
    if (!doc || !doc.body) return "";
    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    );
    let text = "";
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!parent) continue;

      const style = doc.defaultView.getComputedStyle(parent);
      const rect = parent.getBoundingClientRect();

      const visible =
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        parseFloat(style.opacity) > 0 &&
        rect.width > 0 &&
        rect.height > 0;

      if (visible) {
        const content = node.textContent.trim();
        if (content) text += content + " ";
      }
    }
    return text.replace(/\s+/g, " ").trim();
  }

  function extractPage() {
    var fullText = extractDocument(document);
    for (var i = 0; i < window.frames.length; i++) {
      try {
        const iframeDoc = window.frames[i].document;
        fullText += "\n" + extractDocument(iframeDoc);
      } catch (e) {
        // cross-origin
      }
    }
    return fullText;
  }

  const content = extractPage();
  navigator.clipboard.writeText(content).catch((err) => {
    console.error("Failed to copy text: ", err);
  });
}
