# 🎓 Type Inference Guide - How It Works

This guide explains how the automatic type inference system works in this project, written for developers who are new to advanced TypeScript features.

## 📚 Table of Contents

1. [What Problem Are We Solving?](#what-problem-are-we-solving)
2. [The Magic Explained - Step by Step](#the-magic-explained---step-by-step)
3. [Key TypeScript Concepts Used](#key-typescript-concepts-used)
4. [How to Use It](#how-to-use-it)
5. [How to Add New Collections](#how-to-add-new-collections)
6. [Troubleshooting](#troubleshooting)

---

## What Problem Are We Solving?

### ❌ The Old Way (Manual Type Annotations)

Before, you had to manually specify types everywhere:

```typescript
// You had to tell TypeScript what type of data you're working with
const todos = useCollection<TodoRecord>("todos")
const patients = useCollection<PatientsRecord>("patients")
const createTodo = useCreateRecord<TodoRecord>("todos")
```

**Problems:**
- Repetitive and error-prone
- Easy to use the wrong type by mistake
- More typing = more chances for bugs
- If you forget the type, you lose autocomplete

### ✅ The New Way (Automatic Type Inference)

Now TypeScript automatically knows the types:

```typescript
// TypeScript automatically knows todos contains TodoRecord[]
const todos = useCollection("todos")

// TypeScript automatically knows patients contains PatientsRecord[]
const patients = useCollection("patients")

// No type needed - automatically inferred!
const createTodo = useCreateRecord("todos")
```

**Benefits:**
- Less code to write
- Impossible to use the wrong type
- Full autocomplete and type safety
- If you change a collection type, it updates everywhere automatically

---

## The Magic Explained - Step by Step

Let's break down exactly how this works, piece by piece.

### Step 1: Define Your Data Structures

First, we define what each record looks like:

```typescript
// src/types/pocketbase-types.ts

// Every record has these base fields
export interface BaseRecord {
  id: string
  created: string
  updated: string
}

// A todo has title and completed fields
export interface TodoRecord extends BaseRecord {
  title: string
  completed: boolean
}

// A patient has a name field
export interface PatientsRecord extends BaseRecord {
  name: string
}
```

**Think of it like this:** 
- `BaseRecord` is like a template that every record must follow
- `TodoRecord` says "I'm a BaseRecord, plus I have title and completed"
- `PatientsRecord` says "I'm a BaseRecord, plus I have name"

### Step 2: Create a Mapping (The Key!)

This is where the magic happens - we create a "lookup table":

```typescript
// src/types/pocketbase-types.ts

export interface CollectionRecords {
  todos: TodoRecord       // When someone says "todos", use TodoRecord
  patients: PatientsRecord // When someone says "patients", use PatientsRecord
  users: UsersRecord      // When someone says "users", use UsersRecord
}
```

**Think of it like this:**
```
CollectionRecords is like a dictionary:
├─ "todos" → TodoRecord
├─ "patients" → PatientsRecord
└─ "users" → UsersRecord
```

When you write `"todos"`, TypeScript looks it up and finds `TodoRecord`.

### Step 3: Create Type Helpers (The Translation Layer)

Now we create helpers that use the lookup table:

```typescript
// src/lib/queries.ts

// Helper 1: Extract the right type based on collection name
type InferRecordType<K> = K extends keyof CollectionRecords 
  ? CollectionRecords[K] 
  : BaseRecord
```

**Let's decode this line by line:**

```typescript
type InferRecordType<K> = 
```
- We're creating a type helper called `InferRecordType`
- `<K>` means it takes a parameter (like a function takes arguments)

```typescript
K extends keyof CollectionRecords 
```
- `keyof CollectionRecords` means: all the keys in our lookup table
- In our case: `"todos" | "patients" | "users"`
- `K extends` means: "Is K one of these known collection names?"

```typescript
? CollectionRecords[K]   // If YES, look up the type in our table
: BaseRecord             // If NO, just use BaseRecord
```
- This is like an if-else statement for types!
- If K is "todos", return `CollectionRecords["todos"]` which is `TodoRecord`
- If K is "unknown", return `BaseRecord` (safe fallback)

**Example in action:**
```typescript
InferRecordType<"todos">     → TodoRecord
InferRecordType<"patients">  → PatientsRecord
InferRecordType<"unknown">   → BaseRecord (fallback)
```

---

```typescript
// Helper 2: Allow both known and unknown collection names
type CollectionName = keyof CollectionRecords | (string & {})
```

**Let's decode this:**

```typescript
keyof CollectionRecords
```
- This gives us: `"todos" | "patients" | "users"`
- These are the collection names we know about

```typescript
| (string & {})
```
- The `|` means "OR"
- `string & {}` is a TypeScript trick that means "any other string"
- This allows you to use collections that aren't in the lookup table yet

**Why do we need both?**
- `keyof CollectionRecords` gives us autocomplete for known collections
- `(string & {})` allows dynamic collections that you haven't defined yet
- Best of both worlds!

### Step 4: Use the Helpers in Hooks

Now we use these helpers in our functions:

```typescript
// src/lib/queries.ts

export function useCollection<K extends CollectionName>(
  collection: K,
  options?: any
) {
  return useQuery(() => ({
    queryKey: [collection, 'list', options],
    queryFn: () => pb.getList<InferRecordType<K>>(collection, 1, 50, options),
    //                        ^^^^^^^^^^^^^^^^^^^
    //                        This is the magic part!
  }))
}
```

**Let's break this down:**

```typescript
export function useCollection<K extends CollectionName>(
  collection: K,
```
- `<K extends CollectionName>` means K can be any collection name
- `collection: K` means the parameter must match K exactly

When you call:
```typescript
const todos = useCollection("todos")
```

TypeScript does this:
1. You passed `"todos"` as the collection parameter
2. TypeScript sets `K = "todos"` (exactly the string you passed)
3. `InferRecordType<K>` becomes `InferRecordType<"todos">`
4. `InferRecordType<"todos">` looks up "todos" in `CollectionRecords`
5. Finds `TodoRecord`
6. Now TypeScript knows the return type contains `TodoRecord[]`!

### Step 5: Why It Works (The Flow)

Here's the complete flow when you write:

```typescript
const todos = useCollection("todos", { sort: "-created" })
```

**TypeScript's thought process:**

```
1. User called useCollection with "todos"
   → K = "todos" (literal type, not just string)

2. Need to determine return type
   → Look at useQuery's return type
   → Which depends on the data from pb.getList<???>

3. What type should we use for pb.getList<???>?
   → Use InferRecordType<K>
   → K is "todos"
   → InferRecordType<"todos">

4. Evaluate InferRecordType<"todos">
   → Is "todos" in keyof CollectionRecords? 
   → YES! (it's in our lookup table)
   → Return CollectionRecords["todos"]
   → Which is TodoRecord

5. So pb.getList<TodoRecord> returns ListResult<TodoRecord>
   
6. Therefore todos.data has type:
   → { items: TodoRecord[], totalItems: number, ... }
   
7. When you access todos.data.items[0].title
   → TypeScript knows it's a string!
   → You get full autocomplete! ✨
```

---

## Key TypeScript Concepts Used

### 1. **Generic Types** (`<T>`)

Think of generics like function parameters, but for types:

```typescript
// Regular function with parameter
function getItem(index: number) { ... }

// Generic type with type parameter
type GetArrayItem<T> = T[]

// Usage
GetArrayItem<string>  → string[]
GetArrayItem<number>  → number[]
```

### 2. **Conditional Types** (`A extends B ? C : D`)

Like if-else statements for types:

```typescript
type IsString<T> = T extends string ? "yes" : "no"

IsString<"hello">  → "yes"
IsString<123>      → "no"
```

### 3. **`keyof`** - Get Object Keys as Types

```typescript
interface Person {
  name: string
  age: number
}

type PersonKeys = keyof Person  → "name" | "age"
```

### 4. **Indexed Access Types** (`T[K]`)

Look up a property type from an object type:

```typescript
interface CollectionRecords {
  todos: TodoRecord
  patients: PatientsRecord
}

type TodoType = CollectionRecords["todos"]  → TodoRecord
```

### 5. **Literal Types**

TypeScript can track the exact string value, not just "string":

```typescript
// Regular type
let normalString: string = "todos"  // Type: string

// Literal type
const literalString = "todos"  // Type: "todos" (exact value!)

// This is why const works better for collection names
const collection = "todos"  // Type: "todos" ✅
let collection2 = "todos"    // Type: string ❌
```

---

## How to Use It

### Basic Usage

```typescript
// 1. Fetch a list of records
const todos = useCollection("todos", { sort: "-created" })
//    ^? Type: CreateQueryResult<ListResult<TodoRecord>>

// 2. Access the data with full type safety
todos.data?.items.forEach(todo => {
  console.log(todo.title)      // ✅ TypeScript knows title exists
  console.log(todo.completed)  // ✅ TypeScript knows completed exists
  console.log(todo.invalid)    // ❌ Error! Property doesn't exist
})

// 3. Fetch a single record
const todo = useRecord("todos", () => params.id)
//    ^? Type: CreateQueryResult<TodoRecord>

// 4. Create a new record
const createTodo = useCreateRecord("todos")
createTodo.mutate({
  title: "New todo",      // ✅ Correct
  completed: false,       // ✅ Correct
  invalid: "field"        // ❌ Error! Not in TodoRecord
})

// 5. Update a record
const updateTodo = useUpdateRecord("todos")
updateTodo.mutate({
  id: "123",
  title: "Updated",       // ✅ Correct
  completed: true,        // ✅ Correct
})

// 6. Delete a record
const deleteTodo = useDeleteRecord("todos")
deleteTodo.mutate("record-id")
```

### Realtime Subscriptions

```typescript
// Automatic type inference for realtime events too!
useRealtimeCollection("todos", (event) => {
  // event.record is automatically typed as TodoRecord
  console.log(event.record.title)     // ✅ Works
  console.log(event.record.invalid)   // ❌ Error
})
```

### Using Untyped Collections

You can still use collections that aren't in `CollectionRecords`:

```typescript
// This works, but returns BaseRecord (no specific fields)
const unknownCollection = useCollection("some_new_collection")

// unknownCollection.data.items has type: BaseRecord[]
// Only has: id, created, updated (basic fields)
```

---

## How to Add New Collections

### Step-by-Step Process

**Step 1:** Define the record type

```typescript
// src/types/pocketbase-types.ts

export interface PostsRecord extends BaseRecord {
  title: string
  content: string
  author: string
  published: boolean
}
```

**Step 2:** Add to the mapping

```typescript
// src/types/pocketbase-types.ts

export interface CollectionRecords {
  users: UsersRecord
  patients: PatientsRecord
  todos: TodoRecord
  posts: PostsRecord  // ← Add this line!
}
```

**Step 3:** That's it! Now it works everywhere:

```typescript
// Automatically typed as PostsRecord[]
const posts = useCollection("posts")

// Automatically typed for PostsRecord
const createPost = useCreateRecord("posts")

// Full autocomplete!
posts.data?.items.forEach(post => {
  console.log(post.title)      // ✅ Works
  console.log(post.content)    // ✅ Works
  console.log(post.published)  // ✅ Works
})
```

### Complete Example

Let's add a "comments" collection from scratch:

```typescript
// 1. Define the structure
export interface CommentsRecord extends BaseRecord {
  content: string
  author: string
  postId: string
  likes: number
}

// 2. Add to the appropriate collection table
interface AppCollections {
  patients: PatientsRecord
  todos: TodoRecord
  comments: CommentsRecord  // ← Add to table
}

// CollectionRecords automatically includes it via extending
export interface CollectionRecords 
  extends AuthCollections,
          AppCollections {}

// 3. Use it in your component
function CommentsPage() {
  const comments = useCollection("comments", { sort: "-created" })
  //    ^? Automatically knows it's CommentsRecord[]
  
  const createComment = useCreateRecord("comments")
  //    ^? Automatically knows it expects CommentsRecord fields
  
  useRealtimeCollection("comments")
  //    ^? Automatically syncs CommentsRecord updates
  
  return (
    <For each={comments.data?.items}>
      {(comment) => (
        // comment is typed as CommentsRecord
        // Full autocomplete for all fields!
        <div>
          <p>{comment.content}</p>
          <span>By {comment.author}</span>
          <span>{comment.likes} likes</span>
        </div>
      )}
    </For>
  )
}
```

---

## Troubleshooting

### Problem: No autocomplete for collection names

**Symptom:**
```typescript
const data = useCollection("tod")  // No autocomplete suggestions
```

**Solution:**
Make sure your collection is in `CollectionRecords`:

```typescript
export interface CollectionRecords {
  todos: TodoRecord  // ← Must be here for autocomplete
}
```

### Problem: Wrong type inferred

**Symptom:**
```typescript
const todos = useCollection("todos")
// todos.data.items has wrong type
```

**Solution:**
1. Check the mapping is correct:
```typescript
export interface CollectionRecords {
  todos: TodoRecord  // ← Make sure this matches
}
```

2. Make sure TodoRecord is defined:
```typescript
export interface TodoRecord extends BaseRecord {
  title: string
  completed: boolean
}
```

### Problem: Can't access specific fields

**Symptom:**
```typescript
const data = useCollection("todos")
data.data?.items[0].title  // Error: Property 'title' does not exist
```

**Possible causes:**

1. **Using `let` instead of `const`:**
```typescript
// ❌ BAD - TypeScript sees this as just "string"
let collection = "todos"
const data = useCollection(collection)

// ✅ GOOD - TypeScript sees this as literal "todos"
const collection = "todos"
const data = useCollection(collection)

// ✅ EVEN BETTER - Use directly
const data = useCollection("todos")
```

2. **Collection not in mapping:**
```typescript
// Add it to CollectionRecords!
export interface CollectionRecords {
  todos: TodoRecord  // ← Must be here
}
```

### Problem: Type errors after adding new collection

**Symptom:**
```typescript
// Added new collection but getting errors
const posts = useCollection("posts")
```

**Solution:**
Make sure you:
1. Defined the record type
2. Added to CollectionRecords
3. Restarted TypeScript server (VS Code: `Cmd+Shift+P` → "Restart TypeScript Server")

---

## Advanced: How TypeScript Resolves Types

Want to see how TypeScript thinks? Hover over variables in VS Code:

```typescript
const todos = useCollection("todos")
//    ^? Hover here to see the type

// You'll see something like:
// const todos: CreateQueryResult<{
//   items: TodoRecord[]
//   page: number
//   perPage: number
//   totalItems: number
//   totalPages: number
// }>
```

You can also use the `type` command in TypeScript to check:

```typescript
type TodosType = ReturnType<typeof useCollection<"todos">>
// Expands to show the full type structure
```

---

## Summary

### The Three Key Parts:

1. **Record Definitions** - What each type of data looks like
   ```typescript
   export interface TodoRecord extends BaseRecord { ... }
   ```

2. **Collection Mapping** - The lookup table
   ```typescript
   export interface CollectionRecords {
     todos: TodoRecord
   }
   ```

3. **Type Helpers** - The inference logic
   ```typescript
   type InferRecordType<K> = K extends keyof CollectionRecords 
     ? CollectionRecords[K] 
     : BaseRecord
   ```

### The Flow:

```
You write → "todos"
     ↓
TypeScript captures → K = "todos" (literal type)
     ↓
InferRecordType looks up → CollectionRecords["todos"]
     ↓
Finds → TodoRecord
     ↓
Returns fully typed data → { items: TodoRecord[], ... }
     ↓
You get → Full autocomplete and type safety! ✨
```

### Remember:

- **One place to define types** - `CollectionRecords` interface
- **Automatic everywhere** - All hooks use the same system
- **Type-safe by default** - Can't use wrong types accidentally
- **Still flexible** - Can use undefined collections (falls back to BaseRecord)

---

## Questions?

If you're still confused about any part, remember:

1. You don't need to understand all the TypeScript magic to use it
2. Just add your collections to `CollectionRecords` and it works
3. TypeScript is doing all the hard work in the background
4. The benefit is: you get autocomplete and catch errors before runtime!

Happy coding! 🚀
