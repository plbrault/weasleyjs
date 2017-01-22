## Classes

<dl>
<dt><a href="#Weasley">Weasley</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#lazyLoad">lazyLoad(absolutePath, [nameOfExport])</a> ⇒ <code><a href="#LazyLoadResult">LazyLoadResult</a></code></dt>
<dd><p>Lazy-load a module so that it will not actually be imported until it is used for the first time.
Useful during unit testing to override a module&#39;s dependency with a mock between the importation
and the actual testing.</p>
<p>This function does not directly return a lazy-loaded module, but instead returns an object with
the following properties to access the actual module: <code>asObject</code> for when the lazy-loaded module
is an object, <code>asFunction</code> for when it is a function, and <code>asClass</code> for anything that you have
to call the <code>new</code> operator on.</p>
<p>Be aware that the module will not be loaded from cache, so if you lazy-load the same module at
multiple places in your code, you will get different copies of the same module.</p>
<p>Usage Example:</p>
<pre><code>const myAwesomeModule = lazyLoad(require.resolve(&#39;./myAwesomeModule&#39;)).asObject;
</code></pre></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#LazyLoadResult">LazyLoadResult</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="Weasley"></a>

## Weasley
**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| container | <code>Object</code> | Provides access to the dependency tree. For instance, to access                                to a dependency registered under the key `my.awesome.dependency`,                                use `container.my.awesome.dependency`. |


* [Weasley](#Weasley)
    * [new Weasley()](#new_Weasley_new)
    * [.register(key, resolver, [nameOfExport])](#Weasley+register)
    * [.snapshot()](#Weasley+snapshot)
    * [.revert()](#Weasley+revert)

<a name="new_Weasley_new"></a>

### new Weasley()
A tremendously simple dependency injection container for JavaScript.

<a name="Weasley+register"></a>

### weasley.register(key, resolver, [nameOfExport])
Register a new dependency.

**Kind**: instance method of <code>[Weasley](#Weasley)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  | The key for accessing the dependency. It can contain dots to represent a                       dependency hierarchy, e.g. 'my.awesome.dependency'.                       If the key already exists, it is overriden by the new dependency.                       You may register multiple dependencies as children of a same dependency                       tree, e.g. `my.awesome.dependency` and `my.awesome.module`.                       However, you cannot register a dependency as a child of another                       dependency, e.g. `my.awesome.module` and `my.awesome.module.is.awesome`. |
| resolver | <code>function</code> |  | A function that returns a module,                              e.g. () => require('./myAwesomeDependency'). |
| [nameOfExport] | <code>string</code> | <code>&quot;default&quot;</code> | The name of the module's export to use as the                                          dependency.                                          If no value is provided for this parameter, and a                                          `default` export is available, then it is that                                          export that will be used. To avoid this behavior,                                          pass '*' to this parameter. |

<a name="Weasley+snapshot"></a>

### weasley.snapshot()
Take a snapshot of the current dependency tree, so that you can revert back to it later.

**Kind**: instance method of <code>[Weasley](#Weasley)</code>  
<a name="Weasley+revert"></a>

### weasley.revert()
Revert to the last dependency tree snapshot.

**Kind**: instance method of <code>[Weasley](#Weasley)</code>  
<a name="lazyLoad"></a>

## lazyLoad(absolutePath, [nameOfExport]) ⇒ <code>[LazyLoadResult](#LazyLoadResult)</code>
Lazy-load a module so that it will not actually be imported until it is used for the first time.
Useful during unit testing to override a module's dependency with a mock between the importation
and the actual testing.

This function does not directly return a lazy-loaded module, but instead returns an object with
the following properties to access the actual module: `asObject` for when the lazy-loaded module
is an object, `asFunction` for when it is a function, and `asClass` for anything that you have
to call the `new` operator on.

Be aware that the module will not be loaded from cache, so if you lazy-load the same module at
multiple places in your code, you will get different copies of the same module.

Usage Example:
```
const myAwesomeModule = lazyLoad(require.resolve('./myAwesomeModule')).asObject;
```

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| absolutePath | <code>string</code> |  | The absolute path to the module. Typically you will want to use                                `require.resolve` for getting this,                                e.g. `require.resolve('./myAwesomeModule');`. |
| [nameOfExport] | <code>string</code> | <code>&quot;default&quot;</code> | The name of the module's export to use.                                          If no value is provided for this parameter, and a                                          `default` export is available, then it is that                                          export that will be used. To avoid this behavior,                                          pass '*' to this parameter. |

<a name="LazyLoadResult"></a>

## LazyLoadResult : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| asObject | <code>Object</code> | Allows access to the lazy-loaded module as an object. |
| asFunction | <code>Object</code> | Allows access to the lazy-loaded module as a simple function. |
| asClass | <code>Object</code> | Allows access to the lazy-loaded module for calling the `new`                              operator on it. |

