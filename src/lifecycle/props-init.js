import {
  rendererDebounced as $rendererDebounced
} from '../util/symbols';
import data from '../util/data';
import empty from '../util/empty';
import getAttrMgr from '../util/attributes-manager';
import getDefaultValue from '../util/get-default-value';
import getInitialValue from '../util/get-initial-value';
import getPropData from '../util/get-prop-data';

export function createNativePropertyDescriptor (propDef) {
  const nameOrSymbol = propDef.name;

  const prop = {
    configurable: true,
    enumerable: true
  };

  prop.created = function created (elem) {
    const attrName = propDef.attrName;

    // Store attribute to property link.
    if (attrName) {
      data(elem, 'attributeLinks')[attrName] = nameOrSymbol;
    }

    let initialValue = elem[nameOrSymbol];

    // Set up initial value if it wasn't specified.
    if (empty(initialValue)) {
      if (attrName && elem.hasAttribute(attrName)) {
        initialValue = propDef.deserialize(elem.getAttribute(attrName));
      } else if ('initial' in propDef) {
        initialValue = getInitialValue(elem, propDef);
      } else {
        initialValue = getDefaultValue(elem, propDef);
      }
    }

    initialValue = propDef.coerce(initialValue);

    const propData = getPropData(elem, nameOrSymbol);
    propData.internalValue = initialValue;
  };

  prop.get = function get () {
    const propData = getPropData(this, nameOrSymbol);
    const { internalValue } = propData;
    return propDef.get ? propDef.get(this, { name: nameOrSymbol, internalValue }) : internalValue;
  };

  prop.set = function set (newValue) {
    const propData = getPropData(this, nameOrSymbol);

    const useDefaultValue = empty(newValue);
    if (useDefaultValue) {
      newValue = getDefaultValue(this, propDef);
    }

    newValue = propDef.coerce(newValue);

    if (propDef.set) {
      let { oldValue } = propData;

      if (empty(oldValue)) {
        oldValue = null;
      }
      const changeData = { name: nameOrSymbol, newValue, oldValue };
      propDef.set(this, changeData);
    }

    // Queue a re-render.
    this[$rendererDebounced](this);

    // Update prop data so we can use it next time.
    propData.internalValue = propData.oldValue = newValue;

    // Link up the attribute.
    if (propDef.attrName && !propData.settingProp) {
      // Note: setting the prop to empty implies the default value
      // and therefore no attribute should be present!
      let serializedValue = useDefaultValue ? null : propDef.serialize(newValue);
      getAttrMgr(this).setAttrValue(propDef.attrName, serializedValue);
    }
  };

  return prop;
}
